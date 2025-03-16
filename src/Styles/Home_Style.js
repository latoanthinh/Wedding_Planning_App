import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f9f9f9',
    
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    fontSize: 20,
    color: '#666',
   fontFamily:'Playfair-re',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
      
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    width: 24,
    height: 24,

  },
  greetingText: {
    fontSize: 22,
    color: '#333',
    marginLeft: 20,
    marginBottom: 6,
    fontFamily: 'Playfair_me'
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 20,
    marginBottom: 20,
    fontFamily: 'Playfair_me'
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Playfair_me',
    color: '#333',
    marginLeft: 0,
    marginBottom: 0,
  },
  dealsTitle: {
    fontSize: 20,
    fontFamily: 'Playfair_me',
    color: '#333',
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sliderContainer: {
    position: 'relative',
    height: 140,
    marginBottom: 20,
  },
  slide: {
    width: 360,
    height: 140,
    position: 'relative',
  },
  slideImage: {
    width: 320,
    height: 140,
    borderRadius: 10,
    alignSelf: 'center',
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  slideTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Playfair_me',
    marginBottom: 10,
    marginLeft: 10
  },
  exploreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 10
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Playfair_me',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 20,
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  recommendedTitle: {
    fontSize: 18,
    fontFamily: 'Playfair_me',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
    fontFamily: 'Playfair_me',
    textDecorationLine: 'underline'
  },
  hallListContainer: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 20,
    paddingTop: 20
  },
  backgroudhall: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0', 
    position: 'relative', 
  },
  imghall: {
    width: '100%',
    height: 130,
    borderRadius: 8,
    marginBottom: 8,
  },
  namehall: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'Playfair_me',
  },
  bottomhall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Playfair_me',
  },
  errorContainer: {
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontWeight: '500',
    fontFamily: 'Playfair_me',
  },
  dressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  imageContainer: {
    marginHorizontal: 20,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dressImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    alignSelf: 'center',
  },
  dressTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dressCollectionText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Playfair_me',
    marginBottom: 5,
  },
  dressSubtitle: {
    color: '#fff',
    fontSize: 7,
    opacity: 0.9,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 15,
  },
  locationItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flowerItem: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginLeft: 20,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },
  flowerIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#333',
    marginVertical: 8,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 13,
    fontFamily: 'Playfair_me',
  },
  flowerContainer: {
    width: '90%',
    height: 150,
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 15,
    position: 'relative',
  },
  flowerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    right: 0,
    width: '50%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  textContainer: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    alignItems: 'flex-end',
  },
  flowerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Playfair_me',
  },
  statusText: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 5,
    fontFamily: 'Playfair_me',
    textDecorationLine: 'underline'
  },
  surveyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginHorizontal: 20,
    marginBottom: 20,
    height: 100
  },

  surveyIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginLeft: 15,
  },

  surveyContent: {
    flex: 1,
    marginLeft: 15,
  },

  surveyText: {
    fontSize: 14,
    fontFamily: 'Playfair_me',
    color: '#333',
    marginBottom: 8,
  },

  surveyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  surveyButtonIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
    marginRight: 8,
  },

  surveyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Playfair_me',
  },

});

export default styles;
