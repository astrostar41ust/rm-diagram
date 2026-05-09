package com.rmdiagram.dataio;

import com.rmdiagram.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class DataIoController {

    private final DataIoService dataIoService;

    @GetMapping(value = "/export", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DataIoDto.ExportPayload> export(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=\"rm-diagram-export.json\"")
                .body(dataIoService.export(user.getId()));
    }

    @PostMapping("/import")
    public ResponseEntity<DataIoDto.ImportSummary> importData(
            @AuthenticationPrincipal User user,
            @RequestBody DataIoDto.ExportPayload payload) {
        return ResponseEntity.ok(dataIoService.importData(user.getId(), payload));
    }
}
