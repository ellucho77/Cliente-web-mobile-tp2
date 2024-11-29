<template>
  <div class="card mt-4">
    <div class="card-body">
      <h3 class="card-title">Comentarios</h3>

     
      <form @submit.prevent="addComment" v-if="isAuthenticated" class="mb-3">
        <div class="mb-3">
          <textarea
            v-model="comment"
            class="form-control"
            placeholder="Escribe tu comentario"
            rows="3"
            required
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Agregar Comentario</button>
      </form>

    
      <div v-else>
        <p class="text-muted">No estás autenticado. Inicia sesión para agregar un comentario.</p>
      </div>

    
      <ul class="list-group list-group-horizontal flex-wrap mt-3">
  <li v-for="c in comments" :key="c.id" class="list-group-item flex-fill me-3">
    <div class="comment">
      <img :src="c.profileImage || defaultProfileImage" alt="Foto de perfil" class="profile-image" />
      <div class="comment-content">
        <p><strong>{{ c.email }}</strong></p>
        <p>{{ c.text }}</p>
      </div>
    </div>
  </li>
</ul>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '@/firebase/firebaseConfig';

export default {
  props: {
    postId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const comments = ref([]);
    const comment = ref('');
    const isAuthenticated = ref(false);
    const defaultProfileImage = new URL('@/assets/2d.jpg', import.meta.url).href;


    const fetchUserProfile = async (userId) => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          return userDoc.data().profileImage || defaultProfileImage;
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
      return defaultProfileImage;
    };

 
    const fetchComments = async () => {
      const querySnapshot = await getDocs(collection(db, `posts/${props.postId}/comments`));
      const enrichedComments = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const profileImage =
            data.profileImage || (await fetchUserProfile(data.userId)) || defaultProfileImage;
          return {
            id: doc.id,
            ...data,
            profileImage,
          };
        })
      );
      comments.value = enrichedComments;
    };

 
    const addComment = async () => {
      const user = auth.currentUser;
      if (user) {
        const profileImage = user.photoURL || defaultProfileImage; 
        await addDoc(collection(db, `posts/${props.postId}/comments`), {
          text: comment.value,
          userId: user.uid,
          email: user.email,
          profileImage, 
          createdAt: new Date(),
        });
        comment.value = ''; 
        fetchComments(); 
      } else {
        alert('Necesitas estar autenticado para comentar');
      }
    };

   
    onMounted(() => {
      auth.onAuthStateChanged((user) => {
        isAuthenticated.value = !!user; 
      });
      fetchComments(); 
    });

    return { comments, comment, addComment, isAuthenticated, defaultProfileImage };
  },
};



</script>

<style scoped>
.comment-section {
  max-width: 300px;
  
}

.card-body {
  background-color:rgba(212, 36, 124, 0.425); 
  border: none;

  
}

.profile-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}



.list-group-item {
  padding: 10px;
  background-color: #f9f9f967;
  margin: 2%;
 
 
}
</style>

