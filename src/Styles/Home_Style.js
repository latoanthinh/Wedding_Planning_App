import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rightHeader: {
    flexDirection: 'row',
  },
  notificationImage: {
    marginRight: 25,
  },
  homeIcon: {
    width: 24,
    height: 24,
  },
  searchInputContainer: {
    marginBottom: 20,
  },
  input: {
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    backgroundColor: '#f3f3f3',
    marginVertical: 10,
    paddingStart: 20,
  },
  addButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#3498db',
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  deleteImage: {
    width: 20,
    height: 20,
    marginEnd: 10,
  },
  itemList: {
    fontSize: 14,
    paddingStart: 5,
  },
  greetingText: {
    fontSize: 26,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 10,
  },
  dealsTitle: {
    fontSize: 26,
    marginTop: 10,
    fontWeight: 'bold',
  },
  sliderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 350,
    height: 180,
  },
  slide: {
    width: 350,
    height: "100%",
    alignItems: "center",
  },
  image: {
    width: 320,
    height: 140,
    borderRadius: 10,
    margin: 8,
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
  },
  description: {
    fontSize: 32,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 5,
    flexDirection: "row",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#bbb",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#3498db",
  },
  recommendedTitle: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
  dressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
  },
  viewAll: {
    fontSize: 16,
    marginTop: 8,
    color: '#38E03F',
    textDecorationLine: 'underline',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  dressRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 50,
  },
  locationItem: {
    padding: 10,
  },
  locationTitle: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 13,
    marginTop: 8,
    color: 'orange',
    marginStart: 20,
  },
  backgroudClo: {
    alignItems: "center",
  },
  imgClo: {
    width: 110,
    height: 122,
    marginRight: 10,
    borderRadius: 10,
  },
  nameClo: {
    fontSize: 12,
    fontWeight: "bold",
  },
  bottomhall: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems:"center"
  },
  namehall: {
    fontSize: 18,
    fontWeight: "bold",
  },
  imghall: {
    width: "100%",
    height: 140,
  },
  backgroudhall: {
    borderWidth: 0.5,
    width: 320,
    height: 230,
    padding: 8,
    margin: 10,
  },
  Combo: {
    width: 320,
    height: 40,
    backgroundColor: "#CECBCB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  Tou: {
    height: 50,
    justifyContent: "center",
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#CECBCB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default styles;