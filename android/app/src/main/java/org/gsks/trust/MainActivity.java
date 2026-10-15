package org.gsks.trust;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestAllAppPermissions();
    }

    private void requestAllAppPermissions() {
        List<String> permissionsNeeded = new ArrayList<>();

        // 1. Notification (Android 13+ / Tiramisu)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            addPermissionIfMissing(permissionsNeeded, Manifest.permission.POST_NOTIFICATIONS);
        }

        // 2. Camera & Audio
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.CAMERA);
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.RECORD_AUDIO);

        // 3. Location (Fine & Coarse)
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.ACCESS_FINE_LOCATION);
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.ACCESS_COARSE_LOCATION);

        // 4. Contacts
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.READ_CONTACTS);
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.WRITE_CONTACTS);

        // 5. Phone & Call
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.CALL_PHONE);
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.READ_PHONE_STATE);

        // 6. SMS
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.SEND_SMS);
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.RECEIVE_SMS);
        addPermissionIfMissing(permissionsNeeded, Manifest.permission.READ_SMS);

        // 7. Storage / Media (Images / Photos)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            addPermissionIfMissing(permissionsNeeded, Manifest.permission.READ_MEDIA_IMAGES);
            addPermissionIfMissing(permissionsNeeded, Manifest.permission.READ_MEDIA_AUDIO);
            addPermissionIfMissing(permissionsNeeded, Manifest.permission.READ_MEDIA_VIDEO);
        } else {
            addPermissionIfMissing(permissionsNeeded, Manifest.permission.READ_EXTERNAL_STORAGE);
            addPermissionIfMissing(permissionsNeeded, Manifest.permission.WRITE_EXTERNAL_STORAGE);
        }

        if (!permissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                permissionsNeeded.toArray(new String[0]),
                PERMISSION_REQUEST_CODE
            );
        }
    }

    private void addPermissionIfMissing(List<String> list, String permission) {
        if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
            list.add(permission);
        }
    }
}
