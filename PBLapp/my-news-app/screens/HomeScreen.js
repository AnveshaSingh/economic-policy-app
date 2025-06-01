import React, { useEffect, useState } from "react";
import {
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import styles from "../AppStyle"; // Import styles

const NEWS_API_NY = `https://api.nytimes.com/svc/topstories/v2/business.json?api-key=93JpdasLVdb77SMBxd0l1UAxZgwMMNOi`;
const NEWS_API_GUARDIAN = `https://content.guardianapis.com/search?section=business&page-size=50&api-key=d25ca2c2-14d4-439e-ab5d-ed244a0bda53&show-fields=thumbnail,headline`;
const NEWS_API_ECONOMICTIMES = `https://newsapi.org/v2/everything?q=economic%20times&pageSize=50&sortBy=publishedAt&apiKey=adb061a9e4694994941e894da6e3d081`;

const HomeScreen = ({ navigation }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const nyResponse = await fetch(NEWS_API_NY);
        const nyData = await nyResponse.json();

        const guardianResponse = await fetch(NEWS_API_GUARDIAN);
        const guardianData = await guardianResponse.json();

        const etResponse = await fetch(NEWS_API_ECONOMICTIMES);
        const etData = await etResponse.json();

        const etArticles = Array.isArray(etData.articles)
          ? etData.articles.map((item) => ({
              source: item.source.name,
              title: item.title,
              url: item.url,
              thumbnail: item.urlToImage,
              published_date: item.publishedAt,
            }))
          : [];
        etArticles.filter((item) => item.source == "Economic Times");

        const nyArticles = Array.isArray(nyData.results)
          ? nyData.results.map((item) => ({
              ...item,
              source: "NY Times",
              title: item.title,
              url: item.url,
              thumbnail: item.multimedia?.[0]?.url || null,
              published_date: item.published_date,
            }))
          : [];

        const guardianArticles = Array.isArray(guardianData?.response?.results)
          ? guardianData.response.results.map((item) => ({
              ...item,
              source: "The Guardian",
              title: item.fields?.headline || item.webTitle,
              url: item.webUrl,
              thumbnail: item.fields?.thumbnail || null,
              webPublicationDate: item.webPublicationDate,
            }))
          : [];

        const nyandgaurd = [...nyArticles, ...guardianArticles].sort(
          (a, b) =>
            new Date(b.published_date || b.webPublicationDate) -
            new Date(a.published_date || a.webPublicationDate)
        );

        const combinedArticles = [
          ...etArticles.filter((item) => item.source == "The Times of India"),
          ...nyandgaurd,
        ];

        setArticles(combinedArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );
  }

  return (
    <FlatList
      data={articles}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Details", { article: item })}
        >
          {item.thumbnail && (
            <Image source={{ uri: item.thumbnail }} style={styles.image} />
          )}
          <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default HomeScreen;