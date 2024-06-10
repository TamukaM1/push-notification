import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Notifications from 'expo-notifications';
import OneSignal from 'react-native-onesignal';
import Constants from 'expo-constants';

const DashboardScreen = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const [newUsers, setNewUsers] = useState(0);

    useEffect(() => {
        if (notificationsEnabled) {
            registerForPushNotifications();
        }
    }, [notificationsEnabled]);

    useEffect(() => {
        const oneSignalAppId = Constants.manifest.extra.oneSignalAppId;
        if (!oneSignalAppId) {
            console.error('OneSignal App ID is not set in app configuration.');
            return;
        }

        // Initialize OneSignal
        OneSignal.setAppId(oneSignalAppId);
        OneSignal.setLogLevel(6, 0);
        OneSignal.setRequiresUserPrivacyConsent(true);

        // Handle notification events
        OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
            console.log("OneSignal: notification will show in foreground:", notificationReceivedEvent);
            notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
        });

        OneSignal.setNotificationOpenedHandler(notification => {
            console.log("OneSignal: notification opened:", notification);
        });

        OneSignal.promptForPushNotificationsWithUserResponse(response => {
            console.log('Prompt response:', response);
        });

        // Fetch analytics data
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = () => {
        // Fetch data from your analytics provider
        setTotalUsers(1234);
        setActiveUsers(567);
        setNewUsers(89);
    };

    const registerForPushNotifications = async () => {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert('Failed to get push token for push notification!');
                return;
            }

            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo push token:', token);

            // Register the Expo push token with OneSignal
            OneSignal.sendTag('expoToken', token);
        } catch (error) {
            console.error('Failed to register for push notifications:', error);
        }
    };

    const handleNotificationsPrompt = () => {
        Alert.alert(
            'Enable Notifications?',
            'Do you want this application to send you notifications?',
            [
                {
                    text: 'Yes',
                    onPress: () => {
                        setNotificationsEnabled(true);
                    },
                },
                {
                    text: 'No',
                    onPress: () => {
                        setNotificationsEnabled(false);
                    },
                    style: 'cancel',
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.analyticsContainer}>
                <View style={styles.analyticsItem}>
                    <Icon name="users" size={24} color="#007AFF" />
                    <Text style={styles.analyticsText}>Total Users: {totalUsers}</Text>
                </View>
                <View style={styles.analyticsItem}>
                    <Icon name="line-chart" size={24} color="#4CAF50" />
                    <Text style={styles.analyticsText}>Active Users: {activeUsers}</Text>
                </View>
                <View style={styles.analyticsItem}>
                    <Icon name="user-plus" size={24} color="#FF9800" />
                    <Text style={styles.analyticsText}>New Users: {newUsers}</Text>
                </View>
            </View>

            <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={handleNotificationsPrompt}
            >
                <Text style={styles.textStyle}>Enable Notifications</Text>
            </Pressable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    analyticsContainer: {
        flex: 1,
        width: '90%',
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    analyticsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    analyticsText: {
        fontSize: 16,
        marginLeft: 12,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 5,
        paddingVertical: 12,
        paddingHorizontal: 24,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default DashboardScreen;
