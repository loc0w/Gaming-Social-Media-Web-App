// src/uploadthing.js
import { createUploadthing } from "uploadthing/server";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Avatar yükleme konfigürasyonu
  avatarUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Kullanıcı doğrulama vs.
      const user = req.user;
      if (!user) throw new Error("Unauthorized");
 
      return { userId: user._id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
 
      // Veritabanını güncelle
      await User.findByIdAndUpdate(metadata.userId, {
        avatar: file.url
      });
 
      return { uploadedBy: metadata.userId };
    }),
};