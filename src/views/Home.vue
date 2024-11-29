<template>
  <div class="container mt-5">
    <h1 class="mb-4 text-center">Publicaciones</h1>

    <NewPost @post-created="fetchPosts" class="mb-4" /> 

    <div v-if="posts.length === 0" class="alert alert-warning text-center">No hay publicaciones disponibles.</div>

    <div v-else class="row ">
      <div class="col-12" v-for="post in posts" :key="post.id">
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start"> 

           
              <div class="d-flex">
            
                <div class="album-img-container me-3">
                  <img :src="getAlbumImage(post.albumId)" alt="Album Cover" class="img-fluid" style="max-width: 350px; height: auto;" />
                </div>

       
                <div class="post-content flex-grow-1">
                  <h3 class="card-title">{{ post.title }}</h3>
                  <p class="card-text">{{ post.content }}</p>
                  <p class="card-text">
                    <small class="text-muted">Publicado por {{ post.email }}</small>
                  </p>
                  <div class="album-info">
                    <h5>Álbum: {{ getAlbumName(post.albumId) }}</h5>
                  </div>
                </div>
              </div>

       
              <div class="comment-section ms-3" style="min-width: 250px;">
                <CommentSection :postId="post.id" /> 
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { db } from '@/firebase/firebaseConfig';
  import { collection, getDocs } from 'firebase/firestore';
  import NewPost from '@/components/NewPost.vue';
  import CommentSection from '@/components/CommentSection.vue';
  
  export default {
    components: {
      NewPost,
      CommentSection,
    },
    setup() {
      const posts = ref([]);
      
  
    
      const albums = [
  {
    id: 1,
    name: 'Demon Days',
    image: new URL('@/assets/discografia3-1.jpg', import.meta.url).href,
  },
  {
    id: 2,
    name: 'Plastic Beach',
    image: new URL('@/assets/discografia1-1.jpg', import.meta.url).href,
  },
  {
    id: 3,
    name: 'Humanz',
    image: new URL('@/assets/discografia2-1.jpg', import.meta.url).href,
  },
  {
    id: 4,
    name: 'Gorillaz',
    image: new URL('@/assets/discografia4-1.jpg', import.meta.url).href,
  },
];
      const fetchPosts = async () => {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        posts.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      };
  
      
      const getAlbumName = (albumId) => {
        const album = albums.find(a => a.id === albumId);
        return album ? album.name : 'Álbum desconocido';
      };
  
   
      const getAlbumImage = (albumId) => {
        const album = albums.find(a => a.id === albumId);
        return album ? album.image : '';
      };
  
      onMounted(fetchPosts);
  
      return {
        posts,
        fetchPosts,
        getAlbumName,
        getAlbumImage,
      };
    },
  };
  </script>
  
  <style scoped>

.album-img-container {
  flex-shrink: 0;
}

.img-fluid {
  object-fit: cover;
  width: 100%;
  max-width: 200px;
  height: auto;
}

.comment-section {
  max-width: 300px; 
}

.card-body{
  background-color: rgba(214,34,125,255);
  color: white;
}


</style>