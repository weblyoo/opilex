import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: () => void;
}

interface NotificationDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const { width, height } = Dimensions.get('window');

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isVisible,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const { theme, isDark } = useTheme();
  const [slideAnim] = useState(new Animated.Value(-width));

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, slideAnim]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'error':
        return 'x-circle';
      default:
        return 'info';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.accent;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: theme.colors.surface,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerRight}>
            {notifications.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  Alert.alert(
                    'Clear All Notifications',
                    'Are you sure you want to clear all notifications?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Clear All', style: 'destructive', onPress: onClearAll },
                    ]
                  );
                }}
              >
                <Text style={[styles.clearButtonText, { color: theme.colors.accent }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Icon
                name="x"
                size={20}
                color={theme.colors.iconColor}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon
                name="bell"
                size={48}
                color={theme.colors.accent}
                strokeWidth={1}
              />
              <Text style={[styles.emptyText, { color: theme.colors.accent }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.accent }]}>
                You'll see updates about your rewards and activities here
              </Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  {
                    backgroundColor: notification.read ? 'transparent' : theme.colors.background,
                    borderLeftColor: getNotificationColor(notification.type),
                  },
                ]}
                onPress={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id);
                  }
                  if (notification.action) {
                    notification.action();
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationIconContainer}>
                      <Icon
                        name={getNotificationIcon(notification.type)}
                        size={16}
                        color={getNotificationColor(notification.type)}
                        strokeWidth={2}
                      />
                    </View>
                    <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View style={[styles.unreadDot, { backgroundColor: theme.colors.error }]} />
                    )}
                  </View>
                  
                  <Text style={[styles.notificationMessage, { color: theme.colors.accent }]}>
                    {notification.message}
                  </Text>
                  
                  <Text style={[styles.notificationTime, { color: theme.colors.accent }]}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.85,
    height: height,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 55,
    borderBottomWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginRight: 12,
    letterSpacing: 0.3,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  notificationsList: {
    flex: 1,
    paddingTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  notificationItem: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
    marginLeft: 44,
  },
  notificationTime: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 44,
    opacity: 0.7,
  },
});

export default NotificationDrawer;
