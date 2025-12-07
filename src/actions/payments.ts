/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadProofToSupabase } from "./uploadToSupabase";

export async function getUserPayments(userId: string) {
  try {
    // Get the cycle the user is participating in (NOT just first active cycle)
    const participation = await prisma.participation.findFirst({
      where: {
        userId,
        cycle: { status: "ACTIVE" },
      },
      include: {
        cycle: true,
        payments: {
          orderBy: { monthNumber: "asc" },
        },
      },
    });

    if (!participation) {
      return {
        participation: null,
        payments: [],
        stats: {
          totalPaid: 0,
          totalFines: 0,
          pendingCount: 0,
          overdueCount: 0,
        },
      };
    }

    // Calculate stats
    const paidPayments = participation.payments.filter(
      (p) => p.status === "PAID"
    );
    const totalPaid = paidPayments.reduce(
      (sum, p) => sum + (p.paidAmount || 0),
      0
    );
    const totalFines = participation.payments.reduce(
      (sum, p) => sum + (p.hasFine ? p.fineAmount : 0),
      0
    );
    const pendingCount = participation.payments.filter(
      (p) => p.status === "PENDING"
    ).length;
    const overdueCount = participation.payments.filter((p) => {
      return p.status === "PENDING" && new Date() > p.dueDate;
    }).length;

    return {
      participation: {
        id: participation.id,
        cycleName: participation.cycle.name,
        contributionMode: participation.contributionMode,
        monthlyAmount: participation.monthlyAmount,
        fineAmount: participation.fineAmount,
      },
      payments: participation.payments.map((p) => ({
        id: p.id,
        monthNumber: p.monthNumber,
        amount: p.amount,
        dueDate: p.dueDate,
        paidAt: p.paidAt,
        paidAmount: p.paidAmount,
        status: p.status,
        hasFine: p.hasFine,
        fineAmount: p.fineAmount,
        finePaid: p.finePaid,
        proofOfPayment: p.proofOfPayment,
        verifiedBy: p.verifiedBy,
        verifiedAt: p.verifiedAt,
        notes: p.notes,
      })),
      stats: {
        totalPaid,
        totalFines,
        pendingCount,
        overdueCount,
      },
    };
  } catch (error) {
    console.error("Error getting user payments:", error);
    return {
      participation: null,
      payments: [],
      stats: {
        totalPaid: 0,
        totalFines: 0,
        pendingCount: 0,
        overdueCount: 0,
      },
    };
  }
}

export async function recordPayment(prevState: unknown, formData: FormData) {
  const paymentId = formData.get("paymentId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const proofUrl = formData.get("proofUrl") as string;

  if (!paymentId || !amount) {
    return {
      success: false,
      error: "Payment ID and amount are required",
    };
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { participation: true },
    });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    if (payment.status === "PAID") {
      return {
        success: false,
        error: "This payment has already been marked as paid",
      };
    }

    // Check if overdue
    const isOverdue = new Date() > payment.dueDate;
    const hasFine = isOverdue;
    const fineAmount = hasFine ? payment.participation.fineAmount : 0;

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paidAt: new Date(),
        paidAmount: amount,
        status: "PAID",
        hasFine,
        fineAmount,
        proofOfPayment: proofUrl || null,
      },
    });

    revalidatePath("/dashboard/contributions");

    return {
      success: true,
      message: hasFine
        ? `Payment recorded with ₦${fineAmount.toLocaleString()} fine`
        : "Payment recorded successfully",
      hasFine,
      fineAmount,
    };
  } catch (error) {
    console.error("Record payment error:", error);
    return {
      success: false,
      error: "Failed to record payment",
    };
  }
}

export async function uploadPaymentProof(
  prevState: unknown,
  formData: FormData
) {
  const paymentId = formData.get("paymentId") as string;
  const file = formData.get("proof") as File;

  // === Input Validation ===
  if (!paymentId || !file || file.size === 0) {
    return {
      success: false,
      error: "Payment ID and proof file are required",
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      success: false,
      error: "File size must be less than 5MB",
    };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Only JPG, PNG, and PDF files are allowed",
    };
  }

  try {
    // Get the payment first to check if it's overdue
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { participation: true },
    });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    // Check if overdue and calculate fine
    const isOverdue = new Date() > payment.dueDate;
    const hasFine = isOverdue && payment.status !== "PAID";
    const fineAmount = hasFine ? payment.participation.fineAmount : 0;

    // Upload file
    const uploadUrl = await uploadProofToSupabase(file, paymentId);

    // Update payment with proof and fine info
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        proofOfPayment: uploadUrl,
        status: "PAID",
        paidAt: new Date(),
        paidAmount: payment.amount + fineAmount,
        hasFine,
        fineAmount,
      },
    });

    revalidatePath("/dashboard/contributions");

    return {
      success: true,
      message: hasFine 
        ? `Payment proof uploaded. Note: ₦${fineAmount.toLocaleString()} fine applied for late payment`
        : "Payment proof uploaded successfully",
      url: uploadUrl,
      hasFine,
      fineAmount,
    };
  } catch (error: any) {
    console.error("Upload payment proof error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload payment proof",
    };
  }
}

export async function markPaymentAsPaid(paymentId: string, userId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { participation: true },
    });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    if (payment.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (payment.status === "PAID") {
      return {
        success: false,
        error: "Payment already marked as paid",
      };
    }

    // Check if overdue
    const isOverdue = new Date() > payment.dueDate;
    const hasFine = isOverdue;
    const fineAmount = hasFine ? payment.participation.fineAmount : 0;

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidAmount: payment.amount + fineAmount,
        hasFine,
        fineAmount,
      },
    });

    revalidatePath("/dashboard/contributions");

    return {
      success: true,
      message: hasFine
        ? `Payment marked as paid with ₦${fineAmount.toLocaleString()} fine`
        : "Payment marked as paid",
      hasFine,
      fineAmount,
    };
  } catch (error) {
    console.error("Mark payment as paid error:", error);
    return {
      success: false,
      error: "Failed to mark payment as paid",
    };
  }
}