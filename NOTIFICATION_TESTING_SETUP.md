# Unit Testing Setup for Notification Service

## 🧪 Setting Up Unit Tests

This guide explains how to set up unit testing for the notification service using Jest and React Native Testing Library.

### Prerequisites
- ✅ Node.js and npm installed
- ✅ React Native project set up
- ✅ Jest configured in your project

### Installation

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native react-test-renderer

# Install types for testing
npm install --save-dev @types/jest
```

### Configuration

#### 1. Update `package.json` scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### 2. Create `jest.config.js`
```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|...)/)',
  ],
  collectCoverageFrom: [
    'services/**/*.{js,jsx,ts,tsx}',
    '!services/**/*.d.ts',
  ],
  testMatch: [
    '**/__tests__/**/*.(js,jsx,ts,tsx)',
    '**/*.(test|spec).(js,jsx,ts,tsx)',
  ],
};
```

#### 3. Create `jest.setup.js`
```javascript
import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock Firebase
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    requestPermission: jest.fn(),
    getToken: jest.fn(),
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(),
    hasPermission: jest.fn(),
    setBackgroundMessageHandler: jest.fn(),
  })),
}));

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Alert: {
    alert: jest.fn(),
  },
  PermissionsAndroid: {
    PERMISSIONS: { POST_NOTIFICATIONS: 'POST_NOTIFICATIONS' },
    RESULTS: { GRANTED: 'granted' },
    request: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

### Creating Test Files

#### 1. Create test directory structure
```
__tests__/
  services/
    notificationService.test.ts
    notificationTestUtils.test.ts
```

#### 2. Example: `notificationService.test.ts`
```typescript
import { NotificationService, notificationService } from '../../services/notificationService';
import messaging from '@react-native-firebase/messaging';

// Mock Firebase messaging
jest.mock('@react-native-firebase/messaging');

describe('NotificationService', () => {
  let mockMessaging: jest.Mocked<typeof messaging>;

  beforeEach(() => {
    mockMessaging = messaging as jest.Mocked<typeof messaging>;
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(notificationService);
    });
  });

  describe('requestPermissions', () => {
    it('should request permissions on iOS', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue(1);
      mockMessaging.mockReturnValue({
        requestPermission: mockRequestPermission,
      } as any);

      const service = NotificationService.getInstance();
      const result = await service.requestPermissions();

      expect(mockRequestPermission).toHaveBeenCalledWith({
        sound: true,
        badge: true,
        alert: true,
      });
      expect(result).toBe(true);
    });

    it('should request permissions on Android', async () => {
      // Mock Platform.OS
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        PermissionsAndroid: {
          PERMISSIONS: { POST_NOTIFICATIONS: 'POST_NOTIFICATIONS' },
          RESULTS: { GRANTED: 'granted' },
          request: jest.fn().mockResolvedValue('granted'),
        },
      }));

      const { Platform, PermissionsAndroid } = require('react-native');

      const mockRequestPermission = jest.fn().mockResolvedValue(1);
      mockMessaging.mockReturnValue({
        requestPermission: mockRequestPermission,
      } as any);

      const service = NotificationService.getInstance();
      const result = await service.requestPermissions();

      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        expect.any(Object)
      );
      expect(result).toBe(true);
    });
  });

  describe('getToken', () => {
    it('should return FCM token when available', async () => {
      const mockToken = 'mock-fcm-token';
      const mockGetToken = jest.fn().mockResolvedValue(mockToken);

      mockMessaging.mockReturnValue({
        getToken: mockGetToken,
      } as any);

      const service = NotificationService.getInstance();
      const token = await service.getToken();

      expect(mockGetToken).toHaveBeenCalled();
      expect(token).toBe(mockToken);
    });

    it('should return null when token retrieval fails', async () => {
      const mockGetToken = jest.fn().mockRejectedValue(new Error('Token error'));

      mockMessaging.mockReturnValue({
        getToken: mockGetToken,
      } as any);

      const service = NotificationService.getInstance();
      const token = await service.getToken();

      expect(token).toBeNull();
    });
  });

  describe('subscribeToDevice', () => {
    it('should subscribe to device topic', async () => {
      const mockSubscribeToTopic = jest.fn().mockResolvedValue(undefined);

      mockMessaging.mockReturnValue({
        subscribeToTopic: mockSubscribeToTopic,
      } as any);

      const service = NotificationService.getInstance();
      await service.subscribeToDevice('device_001');

      expect(mockSubscribeToTopic).toHaveBeenCalledWith('device_device_001');
    });
  });

  describe('sendAlertNotification', () => {
    it('should send alert notification with correct format', async () => {
      const mockAlert = {
        device_id: 'device_001',
        type: 'temperature' as const,
        severity: 'critical' as const,
        message: 'Temperature too high',
        timestamp: new Date(),
        acknowledged: false,
      };

      const mockSendNotificationToTopic = jest.fn().mockResolvedValue(undefined);

      // Mock the private method
      const service = NotificationService.getInstance();
      service['sendNotificationToTopic'] = mockSendNotificationToTopic;

      await service.sendAlertNotification(mockAlert);

      expect(mockSendNotificationToTopic).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Aquarium Alert - CRITICAL',
          body: 'Temperature too high',
          data: expect.objectContaining({
            type: 'alert',
            device_id: 'device_001',
            severity: 'critical',
          }),
        }),
        'device_device_001'
      );
    });
  });
});
```

#### 3. Example: `notificationTestUtils.test.ts`
```typescript
import { NotificationTestUtils } from '../../services/notificationTestUtils';
import { notificationService } from '../../services/notificationService';

// Mock the notification service
jest.mock('../../services/notificationService');

describe('NotificationTestUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testPermissions', () => {
    it('should test permissions successfully', async () => {
      const mockService = notificationService as jest.Mocked<typeof notificationService>;

      mockService.areNotificationsEnabled = jest.fn().mockResolvedValue(true);
      mockService.getToken = jest.fn().mockResolvedValue('mock-token');

      const result = await NotificationTestUtils.testPermissions();

      expect(result.hasPermission).toBe(true);
      expect(result.token).toBe('mock-token');
      expect(result.error).toBeUndefined();
    });

    it('should handle permission errors', async () => {
      const mockService = notificationService as jest.Mocked<typeof notificationService>;

      mockService.areNotificationsEnabled = jest.fn().mockRejectedValue(new Error('Permission error'));

      const result = await NotificationTestUtils.testPermissions();

      expect(result.hasPermission).toBe(false);
      expect(result.error).toBe('Permission error');
    });
  });

  describe('runFullNotificationTest', () => {
    it('should run all tests and return results', async () => {
      const mockService = notificationService as jest.Mocked<typeof notificationService>;

      // Mock all service methods to return success
      mockService.areNotificationsEnabled = jest.fn().mockResolvedValue(true);
      mockService.getToken = jest.fn().mockResolvedValue('mock-token');
      mockService.subscribeToGeneralAlerts = jest.fn().mockResolvedValue(undefined);
      mockService.subscribeToDevice = jest.fn().mockResolvedValue(undefined);
      mockService.unsubscribeFromDevice = jest.fn().mockResolvedValue(undefined);

      const results = await NotificationTestUtils.runFullNotificationTest();

      expect(results.permissions).toBe(true);
      expect(results.subscriptions).toBe(true);
      expect(results.alertNotification).toBe(true);
      expect(results.errors).toHaveLength(0);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test notificationService.test.ts
```

### Testing Best Practices

1. **Mock External Dependencies**: Always mock Firebase, React Native modules, and external APIs
2. **Test One Thing at a Time**: Each test should focus on a single functionality
3. **Use Descriptive Test Names**: Make test names clear about what they're testing
4. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
5. **Test Error Cases**: Don't just test success paths, test error scenarios too

### Integration Testing

For integration tests that actually test Firebase connectivity:

```typescript
describe('NotificationService Integration', () => {
  // These tests would require actual Firebase configuration
  // and should be run in a separate test environment

  it.skip('should connect to Firebase and get real token', async () => {
    // Skip in CI, run manually with real Firebase config
  });
});
```

### Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v2
```

---

**🔧 Pro Tips:**
- Use `--verbose` flag for detailed test output
- Set up test scripts in your IDE for quick feedback
- Use `jest --watchAll` for running all tests in watch mode
- Configure VS Code to show test results in the editor
