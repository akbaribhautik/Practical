import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

const App = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`);
      const result = await response.json();
      setData(prevData => [...prevData, ...result]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const computeDetails = (item) => {
    console.log(`Computing details for item ${item.id}`);
    const startTime = performance.now();
    const details = `Computed details for ${item.title}`;
    const endTime = performance.now();
    console.log(`Computation took ${endTime - startTime} ms`);
    return details;
  };

  const memoizedComputeDetails = useMemo(() => computeDetails, [data]);

  const handleLoadMore = () => {
    if (!loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const renderItem = ({ item }) => {
    const details = memoizedComputeDetails(item);
    return (
      <TouchableOpacity onPress={() => setSelectedPost(item.id)}>
        <View style={{ padding: 10, borderBottomWidth: 1 }}>
          <Text>ID: {item.id}</Text>
          <Text>Title: {item.title}</Text>
          <Text>{details}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    return loading ? <ActivityIndicator size="large" color="#0000ff" /> : null;
  };

  const fetchPostDetails = async (postId) => {
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
    }
  };

  const PostDetails = ({ postId, onClose }) => {
    const [postDetails, setPostDetails] = useState(null);

    useEffect(() => {
      const fetchDetails = async () => {
        const details = await fetchPostDetails(postId);
        setPostDetails(details);
      };
      fetchDetails();
    }, [postId]);

    useEffect(() => {
      console.log(`PostDetails component rendered for postId: ${postId}`);
    }, [postId]);

    if (!postDetails) return <ActivityIndicator size="large" color="#0000ff" />;

    return (
      <View style={{ padding: 10 }}>
        <Text>ID: {postDetails.id}</Text>
        <Text>Title: {postDetails.title}</Text>
        <Text>Body: {postDetails.body}</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ color: 'blue' }}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const memoizedSetSelectedPost = useCallback(setSelectedPost, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {selectedPost ? (
        <PostDetails postId={selectedPost} onClose={() => memoizedSetSelectedPost(null)} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default App;
