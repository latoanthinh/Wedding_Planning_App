import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import React, { useState, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const Message = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Xin chào! Hôm nay bạn cần tư vấn gì nào?', fromUser: false, time: new Date().toLocaleTimeString() },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState('');
  const flatListRef = useRef(null);

  const handleSend = useCallback(() => {
    if (newMessage.trim()) {
      const newMessageItem = {
        id: Date.now().toString(),
        text: newMessage,
        fromUser: true,
        time: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, newMessageItem]);
      setNewMessage('');
      autoReply();
    }
  }, [newMessage]);

  const autoReply = () => {
    setIsTyping(true);
    setDots('');

    const interval = setInterval(() => {
      setDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : ''));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      const replyMessageItem = {
        id: Date.now().toString(),
        text: 'Cảm ơn bạn đã gửi tin nhắn! Hệ thống sẽ phản hồi sớm.',
        fromUser: false,
        time: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, replyMessageItem]);
      setIsTyping(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 5000);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.fromUser ? styles.userMessage : styles.systemMessage]}>
      <Text style={[styles.messageText, item.fromUser ? styles.userText : styles.systemText]}>
        {item.text}
      </Text>
      <Text style={styles.timeText}>
        {item.time}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Text style={styles.title}>Tin nhắn</Text>
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messageList}
            />
            {isTyping && (
              <View style={styles.typingContainer}>
                <Text style={styles.typingText}>Hệ thống đang phản hồi{dots}</Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChangeText={setNewMessage}
                maxLength={200}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Text style={styles.buttonText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Message;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    color: '#000',
    marginBottom: 20,
    alignSelf: 'center',
    fontFamily: 'Playfair_me',
  },
  messageList: {
    flexGrow: 1,
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
  },
  systemMessage: {
    backgroundColor: '#EAEAEA',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  userText: {
    color: '#fff',
  },
  systemText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    backgroundColor: '#fff',
    fontSize: 16,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'grey',
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  typingText: {
    color: '#999',
    marginRight: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
});