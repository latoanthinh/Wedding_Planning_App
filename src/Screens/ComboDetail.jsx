import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from "react-native";

const { width } = Dimensions.get('window');

const DetailCombo = ({ route, navigation }) => {
  const { comboData } = route.params || {};
  
  const data = comboData || {
    name: "Premium Wedding Combo",
    price: 14999999,
    imageUrl: require("../Assets/Images/combo.png"),
    description: [ 
      "Comprehensive wedding decor with diverse floral arrangements",
      "Culinary experience featuring traditional and international cuisine",
      "Professional videography and photography coverage",
      "Wedding cake, beverages, and gallery table decorations"
    ],
  };
  console.log(data.imageUrl);

  const formatPrice = (num) => {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formattedPrice = formatPrice(data.price) + "đ";

  const handleContact = () => {
    // Navigate to contact screen or open contact modal
    navigation.navigate('Contact', { comboName: data.name });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Image with Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={data.imageUrl}
            style={styles.image}
          />
          <View style={styles.imageOverlay} />
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {/* Combo Name */}
          <Text style={styles.comboName}>{data.name}</Text>

          {/* Price */}
          <Text style={styles.price}>{formattedPrice}</Text>

          {/* Description Title */}
          <Text style={styles.sectionTitle}>Package Includes:</Text>

          {/* Description Items */}
          {data.description?.map((desc, index) => (
            <View key={index} style={styles.descriptionItemContainer}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.descriptionItem}>{desc}</Text>
            </View>
          ))}

          {/* Contact Button */}
          <TouchableOpacity 
            style={styles.contactButton} 
            onPress={handleContact}
          >
            <Text style={styles.buttonText}>Contact for Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailCombo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  imageContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  comboName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: "600",
    color: "#E53935",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  descriptionItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 10,
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: 'bold',
  },
  descriptionItem: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  contactButton: {
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});