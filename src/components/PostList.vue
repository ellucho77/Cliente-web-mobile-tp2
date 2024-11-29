<template>
  <div>
    <h1>Publicaciones</h1>
    <div v-for="post in posts" :key="post.id" class="post-card">
      <h3>{{ post.title }}</h3>
      <p>{{ post.content }}</p>
      <div class="album-info">
        <h5>Álbum: {{ getAlbumName(post.albumId) }}</h5>
        <img :src="getAlbumImage(post.albumId)" alt="Album Cover" style="width: 100px; height: auto;" />
      </div>
      <CommentSection :postId="post.id" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { db } from '../firebase/firebaseConfig'; 
import CommentSection from './CommentSection.vue';

export default {
  components: { CommentSection },
  setup() {
    const posts = ref([]);
    const albums = [
      {
        id: 1,
        name: 'Demon Days',
        image: new URL('@/assets/discografia2-1.jpg', import.meta.url).href,
        
      },
      {
        id: 2,
        name: 'Plastic Beach',
        image: new URL('@/assets/discografia1-1.jpg', import.meta.url).href,
      },
      {
        id: 3,
        name: 'Humanz',
        image: new URL('@/assets/discografia3-1.jpg', import.meta.url).href,
        
      },
      {
        id: 4,
        name: 'Gorillaz',
        image: new URL('@/assets/discografia4-1.jpg', import.meta.url).href,
      },
    ];

    
    const loadPosts = async () => {
      const snapshot = await db.collection('posts').get();
      posts.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    };

    
    const getAlbumName = (albumId) => {
      const album = albums.find((a) => a.id === albumId);
      return album ? album.name : 'Álbum desconocido';
    };

    
    const getAlbumImage = (albumId) => {
      const album = albums.find((a) => a.id === albumId);
      return album ? album.image : '';
    };

    loadPosts(); 

    return { posts, getAlbumName, getAlbumImage };
  },
};
</script>

<style scoped>
.post-card {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.album-info {
  margin-top: 10px;
}
</style>

