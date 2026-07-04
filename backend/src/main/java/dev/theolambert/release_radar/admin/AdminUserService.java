package dev.theolambert.release_radar.admin;

import dev.theolambert.release_radar.admin.dto.AdminUserResponse;
import dev.theolambert.release_radar.user.Role;
import dev.theolambert.release_radar.user.User;
import dev.theolambert.release_radar.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getCreatedAt))
                .map(AdminUserResponse::from)
                .toList();
    }

    @Transactional
    public AdminUserResponse changeRole(UUID currentUserId, UUID targetId, Role role) {
        if (currentUserId.equals(targetId)) {
            throw new IllegalArgumentException("You cannot change your own role");
        }
        User user = userRepository.findById(targetId).orElseThrow();
        user.setRole(role);
        return AdminUserResponse.from(user);
    }

    @Transactional
    public void deleteUser(UUID currentUserId, UUID targetId) {
        if (currentUserId.equals(targetId)) {
            throw new IllegalArgumentException("You cannot delete your own account");
        }
        User user = userRepository.findById(targetId).orElseThrow();
        userRepository.delete(user);
    }
}
