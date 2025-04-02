import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Lottie from 'lottie-react-native';
import LoadingIndicator from '../components/LoadingIndicator';

const StreetView = () => {
    const [loading, setLoading] = useState(true);
    const streetViewUrl = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=36.1215,-115.1695';

    const renderLoading = () => (
        <LoadingIndicator text="Đang tải dữ liệu..." type="overlay" />
    );

    return (
        <View style={styles.container}>
            {loading && renderLoading()}
            <WebView
                source={{ uri: streetViewUrl }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    loadingAnimation: {
        width: 120,
        height: 120,
    },
    loadingText: {
        fontSize: 20,
        color: '#666',
        marginTop: 10,
    },
});

export default StreetView;