import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';

const Message = () => {
  const [messages, setMessages] = useState([
    { id: '1', text: 'Xin chào! Bạn có khỏe không?', fromUser: false },
    { id: '2', text: 'Hẹn gặp lại vào cuối tuần nhé!', fromUser: false },
    { id: '3', text: 'Bạn đã hoàn thành nhiệm vụ chưa?', fromUser: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dots, setDots] = useState('');
  const flatListRef = useRef(null);

  const suggestions = [
    'xin chao',
    'ban co khoe',
  ];

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

    let dotInterval = setInterval(() => {
      setDots(prev => (prev.length < 3 ? prev + '.' : ''));
    }, 200);

    setTimeout(() => {
      clearInterval(dotInterval);
      const replyText = getAutoReply(userMessage);
      const replyMessageItem = { id: (messages.length + 2).toString(), text: replyText, fromUser: false };
      setMessages(prevMessages => [...prevMessages, replyMessageItem]);
      setIsTyping(false);
      flatListRef.current.scrollToEnd({ animated: true });
    }, 2000);
  };

  const getAutoReply = (message) => {
    switch (message.toLowerCase()) {
      case 'xin chao':
        return 'Chào bạn! Tôi có thể giúp gì cho bạn?';
      case 'ban co khoe khong':
        return 'Tôi rất tốt, cảm ơn bạn!';
      default:
        return 'Xin lỗi, tôi không hiểu bạn nói gì. Vui lòng thử lại.';
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.fromUser ? styles.userMessage : styles.systemMessage]}>
      <Text style={[styles.messageText, item.fromUser ? styles.userText : styles.systemText]}>{item.text}</Text>
    </View>
  );

  const handleSuggestionPress = (suggestion) => {
    setNewMessage(suggestion);
  };

  useEffect(() => {
    flatListRef.current.scrollToEnd({ animated: true });
  }, [messages]);

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
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity key={index} style={styles.suggestionButton} onPress={() => handleSuggestionPress(suggestion)}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    fontFamily: 'Playfair_me'
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
  suggestionsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  suggestionButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    padding: 10,
    marginRight: 5,
  },
  suggestionText: {
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
    fontFamily: 'Playfair_me'
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
    fontFamily: 'Playfair_me'
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  typingText: {
    color: '#999',
    marginRight: 5,
    fontFamily: 'Playfair-re'
  },
});