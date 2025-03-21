package com.zenkaigains.zenkai_gains_server.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Acl;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.storage.Acl.Role;
import com.google.cloud.storage.Acl.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Service
public class StorageService {

    @Value("${gcs.project-id}")
    private String projectId;

    @Value("${gcs.client-email}")
    private String clientEmail;

    @Value("${gcs.private-key}")
    private String privateKey;

    @Value("${gcs.bucket-name}")
    private String bucketName;

    @Value("${gcs.private-key-id}")
    private String privateKeyId;

    @Value("${gcs.client-id}")
    private String clientId;

    private Storage storage;

    @PostConstruct
    public void init() throws IOException {
        // Replace escaped newline characters in the private key
        String formattedPrivateKey = privateKey.replace("\\n", "\n");

        // Build a complete JSON credentials string with all required fields
        String jsonCredentials = String.format(
                "{\n" +
                        "  \"type\": \"service_account\",\n" +
                        "  \"project_id\": \"%s\",\n" +
                        "  \"private_key_id\": \"%s\",\n" +
                        "  \"private_key\": \"%s\",\n" +
                        "  \"client_email\": \"%s\",\n" +
                        "  \"client_id\": \"%s\"\n" +
                        "}",
                projectId, privateKeyId, formattedPrivateKey, clientEmail, clientId
        );

        GoogleCredentials credentials = GoogleCredentials.fromStream(
                new ByteArrayInputStream(jsonCredentials.getBytes(StandardCharsets.UTF_8))
        );

        storage = StorageOptions.newBuilder()
                .setProjectId(projectId)
                .setCredentials(credentials)
                .build()
                .getService();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = "profile-pictures/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        // ⚠️ Generate signed URL that lasts for 10 years (about 315 million seconds)
        // Max allowed for V4: 7 days = 604800 seconds
        URL signedUrl = storage.signUrl(blobInfo, 7, TimeUnit.DAYS, Storage.SignUrlOption.withV4Signature());

        return signedUrl.toString();
    }


    public String generateSignedUrl(String bucketName, String objectName) {
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, objectName).build();
        URL signedUrl = storage.signUrl(blobInfo, 15, TimeUnit.MINUTES,
                Storage.SignUrlOption.withV4Signature());
        return signedUrl.toString();
    }
}
