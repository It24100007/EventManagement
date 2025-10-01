package com.example.secrud.controllers;

import com.example.secrud.services.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final FileStorageService storageService;

    public UploadController(FileStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        try {
            String url = storageService.store(file);
            Map<String, Object> body = new HashMap<>();
            body.put("url", url);
            return ResponseEntity.status(HttpStatus.CREATED).body(body);
        } catch (Exception e) {
            return error("Failed to upload file", e, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping(path = "/batch", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadBatch(@RequestParam("files") List<MultipartFile> files) {
        try {
            List<String> urls = storageService.storeAll(files);
            Map<String, Object> body = new HashMap<>();
            body.put("urls", urls);
            return ResponseEntity.status(HttpStatus.CREATED).body(body);
        } catch (Exception e) {
            return error("Failed to upload files", e, HttpStatus.BAD_REQUEST);
        }
    }

    private ResponseEntity<Map<String, Object>> error(String msg, Exception e, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", msg);
        body.put("details", e.getMessage());
        return ResponseEntity.status(status).body(body);
    }
}