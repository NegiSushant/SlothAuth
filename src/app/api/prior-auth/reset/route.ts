import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function POST() {
  try {
    // Execute atomic transaction to wipe prepped packets and reset patient request statuses
    await prisma.$transaction([
      prisma.$executeRawUnsafe("DELETE FROM prepped_packets;"),
      prisma.$executeRawUnsafe(
        "UPDATE patient_requests SET status = 'PENDING_PREP';"
      ),
    ]);

    // Optional self-healing check
    const countRes = await prisma.$queryRawUnsafe<
      Array<{ count: string | number }>
    >("SELECT COUNT(*) FROM patient_requests;");

    const count = parseInt(String(countRes[0]?.count || 0), 10);

    if (count === 0) {
      return NextResponse.json({
        success: true,
        message:
          "Simulation reset complete, but patient_requests table is empty. Please run 'bun run db:seed' (or 'npm run db:seed') to populate synthetic test patients.",
        count: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Simulation reset complete. All ${count} synthetic patients are back in PENDING_PREP status.`,
      count,
    });
  } catch (err: unknown) {
    console.error("POST /api/prior-auth/reset error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to reset simulation database",
      },
      { status: 500 }
    );
  }
}
