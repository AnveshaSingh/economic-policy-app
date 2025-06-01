import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5
  },
  detailsContainer: { padding: 10 },
  detailsImage: { width: '100%', height: 300, borderRadius: 10 },
  detailsTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  detailsContent: { fontSize: 16 }
});

export default styles;
