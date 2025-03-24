package com.zenkaigains.zenkai_gains_server.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.HttpMethod;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@Service
public class StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);

    @Value("${gcs.project-id}")
    private String projectId;

    @Value("${gcs.client-email}")
    private String clientEmail;

    @Value("${gcs.private-key}")
    private String privateKey;

    // Use separate properties for the two buckets
    @Value("${gcs.bucket-profile-picture}")
    private String profileBucketName;

    // Changed property key to reflect correct spelling ("transformation")
    @Value("${gcs.bucket-transformation-picture}")
    private String transformationBucketName;

    @Value("${gcs.private-key-id}")
    private String privateKeyId;

    @Value("${gcs.client-id}")
    private String clientId;

    private Storage storage;

    @PostConstruct
    public void init() throws IOException {
        logger.debug("Initializing StorageService...");
        // Replace escaped newline characters in the private key.
        String formattedPrivateKey = privateKey.replace("\\n", "\n");
        logger.debug("Formatted private key prepared.");

        // Build a JSON credentials string with all required fields.
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
        logger.debug("JSON credentials constructed: {}...",
                jsonCredentials.substring(0, Math.min(100, jsonCredentials.length())));

        GoogleCredentials credentials = GoogleCredentials.fromStream(
                new ByteArrayInputStream(jsonCredentials.getBytes(StandardCharsets.UTF_8))
        );
        storage = StorageOptions.newBuilder()
                .setProjectId(projectId)
                .setCredentials(credentials)
                .build()
                .getService();
        logger.debug("Google Cloud Storage service initialized for project: {}", projectId);
    }

    /**
     * Uploads a file (profile picture) to the profile bucket.
     * Generates a signed URL valid for 7 days.
     */
    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = "profile-pictures/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        logger.debug("Uploading file: {} to bucket: {}", fileName, profileBucketName);

        BlobId blobId = BlobId.of(profileBucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());
        logger.debug("File uploaded to bucket.");

        // Generate a signed URL valid for 7 days (maximum for V4 signatures)
        URL signedUrl = storage.signUrl(blobInfo, 7, TimeUnit.DAYS, Storage.SignUrlOption.withV4Signature());
        logger.debug("Generated signed URL (7 days): {}", signedUrl.toString());
        return signedUrl.toString();
    }

    /**
     * Generates a signed URL for uploading a transformation file.
     * This URL is valid for 15 minutes and must be used with a PUT request.
     * The client must use the exact same Content-Type header as specified here.
     */
    public String generateSignedUrl(String bucket, String objectName, String contentType) {
        logger.debug("Generating signed URL for bucket: {}, object: {}, contentType: {}", bucket, objectName, contentType);
        // Build the BlobInfo with the expected content type
        BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectName)
                .setContentType(contentType)
                .build();

        // Generate a signed URL for a PUT request (but WITHOUT withContentType)
        URL signedUrl = storage.signUrl(
                blobInfo,
                15, // 15 minutes validity
                TimeUnit.MINUTES,
                Storage.SignUrlOption.httpMethod(HttpMethod.PUT),
                // Storage.SignUrlOption.withContentType(),  // ❌ remove this line
                Storage.SignUrlOption.withV4Signature()
        );

        logger.debug("Generated signed URL (15 minutes): {}", signedUrl.toString());
        return signedUrl.toString();
    }

    public String generateUploadUrl(String bucket, String objectName, String contentType) {
        logger.debug("Generating signed URL for PUT: bucket={}, object={}, contentType={}", bucket, objectName, contentType);
        BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectName)
                .setContentType(contentType)
                .build();

        URL signedUrl = storage.signUrl(
                blobInfo,
                15, // 15 minutes validity
                TimeUnit.MINUTES,
                Storage.SignUrlOption.httpMethod(HttpMethod.PUT),
                Storage.SignUrlOption.withV4Signature()
        );

        logger.debug("Generated signed PUT URL (15 minutes): {}", signedUrl);
        return signedUrl.toString();
    }

    public String generateGetUrl(String bucket, String objectName) {
        logger.debug("Generating signed URL for GET: bucket={}, object={}", bucket, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(bucket, objectName).build();

        URL signedUrl = storage.signUrl(
                blobInfo,
                7, // 7 days validity
                TimeUnit.DAYS,
                Storage.SignUrlOption.httpMethod(HttpMethod.GET),
                Storage.SignUrlOption.withV4Signature()
        );

        logger.debug("Generated signed GET URL (7 days): {}", signedUrl);
        return signedUrl.toString();
    }

    // Getters for the bucket names

    public String getProfileBucketName() {
        return profileBucketName;
    }

    public String getTransformationBucketName() {
        return transformationBucketName;
    }
}
