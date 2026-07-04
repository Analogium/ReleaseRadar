package dev.theolambert.release_radar.admin;

import dev.theolambert.release_radar.admin.dto.AdminUserResponse;
import dev.theolambert.release_radar.admin.dto.UpdateRoleRequest;
import dev.theolambert.release_radar.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<AdminUserResponse> listUsers() {
        return adminUserService.listUsers();
    }

    @PatchMapping("/{id}/role")
    public AdminUserResponse changeRole(@AuthenticationPrincipal User currentUser,
                                        @PathVariable UUID id,
                                        @Valid @RequestBody UpdateRoleRequest request) {
        return adminUserService.changeRole(currentUser.getId(), id, request.role());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal User currentUser,
                                           @PathVariable UUID id) {
        adminUserService.deleteUser(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
