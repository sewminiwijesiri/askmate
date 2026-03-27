import { connectDB } from "@/lib/mongodb";
import Report from "@/models/Report";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
    try {
        await connectDB();
        
        let reporterId, reportedUserId, reportedUserRole, reason, evidenceUrl;

        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            reporterId = formData.get("reporterId");
            reportedUserId = formData.get("reportedUserId");
            reportedUserRole = formData.get("reportedUserRole");
            reason = formData.get("reason");

            const file = formData.get("file");
            if (file && typeof file !== "string") {
                const buffer = Buffer.from(await file.arrayBuffer());
                try {
                    const uploadResponse = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            { folder: "askmate_reports" },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        ).end(buffer);
                    });
                    evidenceUrl = uploadResponse.secure_url;
                } catch (fileError) {
                    console.error("Cloudinary upload error:", fileError);
                    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
                }
            }
        } else {
            const body = await req.json();
            reporterId = body.reporterId;
            reportedUserId = body.reportedUserId;
            reportedUserRole = body.reportedUserRole;
            reason = body.reason;
        }

        if (!reporterId || !reportedUserId || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newReport = await Report.create({
            reporterId,
            reportedUserId,
            reportedUserRole,
            reason,
            evidence: evidenceUrl
        });

        return NextResponse.json(newReport, { status: 201 });
    } catch (error) {
        console.error("Error creating report:", error);
        return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
    }
}
