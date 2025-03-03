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
  Dimensions,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

const Message = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Xin chào! Bạn có khỏe không?', fromUser: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState('');
  const flatListRef = useRef(null);

  const handleSend = () => {
    if (newMessage.trim()) {
      const newMessageItem = { id: (messages.length + 1).toString(), text: newMessage, fromUser: true };
      setMessages(prevMessages => [...prevMessages, newMessageItem]);
      setNewMessage('');
      autoReply(newMessage);
    }
  };

  const autoReply = (userMessage) => {
    setIsTyping(true);
    setDots('');

    const interval = setInterval(() => {
      setDots(prevDots => (prevDots.length < 3 ? prevDots + '.' : '')); 
    }, 100);

    setTimeout(() => {
      clearInterval(interval); 
      const replyMessageItem = {
        id: (messages.length + 2).toString(),
        text: 'Cảm ơn bạn đã gửi tin nhắn! Hệ thống sẽ xem xét và phản hồi.',
        fromUser: false,
      };
      setMessages(prevMessages => [...prevMessages, replyMessageItem]);
      setIsTyping(false);
      flatListRef.current.scrollToEnd({ animated: true });
    }, 2000);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.fromUser ? styles.userMessage : styles.systemMessage]}>
      <Text style={[styles.messageText, item.fromUser ? styles.userText : styles.systemText]}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
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
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  inner: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#333',
    marginBottom: 20,
    alignSelf: 'center',
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
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: '#007bff',
    alignSelf: 'flex-end',
  },
  systemMessage: {
    backgroundColor: '#F3F3F3',
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
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    elevation: 5,
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
});