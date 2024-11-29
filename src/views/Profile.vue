<template>
  <div class="container mt-5">
    <div class="card shadow">
      <div class="card-body">
        <h3 class="card-title text-center mb-4">Perfil del Usuario</h3>

        <div v-if="user" class="text-center">
        
          <img
            :src="profileImage || defaultProfileImage"
            alt="Imagen de perfil"
            class="rounded-circle mb-3 border profile-image"
          />
          <p class="mb-3 text-muted"><strong>Email:</strong> {{ user.email }}</p>

      
          <button
            class="btn btn-outline-primary btn-sm mb-4"
            @click="showImageSelection = !showImageSelection"
          >
            Cambiar Imagen de Perfil
          </button>

      
          <div v-if="showImageSelection" class="mt-4">
            <h6 class="text-muted">Selecciona una nueva imagen:</h6>
            <div class="d-flex flex-wrap justify-content-center gap-3 mt-3">
              <div
                v-for="(image, index) in profileImages"
                :key="index"
                class="position-relative"
              >
                <img
                  :src="image"
                  alt="Imagen de perfil"
                  class="rounded-circle image-thumbnail border"
                  :class="{ 'border-success': image === profileImage }"
                  @click="selectProfileImage(image)"
                />
                <span
                  v-if="image === profileImage"
                  class="badge bg-success position-absolute top-0 start-100 translate-middle"
                >
                  ✓
                </span>
              </div>
            </div>
            <button class="btn btn-success btn-sm mt-3" @click="saveProfileImage">
              Guardar Imagen
            </button>
          </div>

         
          <div class="update-profile mt-4">
            <h5 class="text-muted">Actualizar Información</h5>
            <form @submit.prevent="reauthenticateAndUpdate" class="mt-3">
              <div class="mb-2">
                <label for="currentPassword" class="form-label">Contraseña actual</label>
                <input
                  type="password"
                  id="currentPassword"
                  v-model="currentPassword"
                  class="form-control form-control-sm"
                  required
                />
              </div>
              <div class="mb-2">
                <label for="email" class="form-label">Nuevo Correo</label>
                <input
                  type="email"
                  id="email"
                  v-model="newEmail"
                  class="form-control form-control-sm"
                  placeholder="(Opcional)"
                />
              </div>
              <div class="mb-2">
                <label for="password" class="form-label">Nueva Contraseña</label>
                <input
                  type="password"
                  id="password"
                  v-model="newPassword"
                  class="form-control form-control-sm"
                  placeholder="(Opcional)"
                />
              </div>
              <button type="submit" class="btn btn-primary btn-sm w-100 mt-2">
                Actualizar Información
              </button>
            </form>
          </div>

        
          <div class="user-posts mt-4">
  <h5 class="text-muted mb-4">Tus Publicaciones</h5>

 
  <div v-if="posts.length > 0" class="row g-3">
    <div
      v-for="post in posts"
      :key="post.id"
      class="col-12 col-md-6 col-lg-4"
    >
      <div class="card shadow-sm h-100">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title text-truncate">{{ post.title }}</h6>
          <p class="card-text small text-muted mb-2">
            {{ post.content }}
          </p>
          <small class="text-muted">Publicado el: {{ post.date }}</small>
          <div class="mt-auto d-flex justify-content-between gap-2">
            <button
              v-if="post.userId === user.uid"
              class="btn btn-warning btn-sm w-50"
              @click="editPost(post)"
            >
              <i class="bi bi-pencil-square me-1"></i> Editar
            </button>
            <button
              v-if="post.userId === user.uid"
              class="btn btn-danger btn-sm w-50"
              @click="deletePost(post.id)"
            >
              <i class="bi bi-trash me-1"></i> Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div v-else class="alert alert-info text-center">
    <i class="bi bi-info-circle-fill me-2"></i> No tienes publicaciones aún.
  </div>
</div>

        </div>

        <div v-else>
          <div class="alert alert-warning text-center mt-4" role="alert">
            No estás autenticado. Inicia sesión para ver tu perfil.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-image {
  width: 120px;
  height: 120px;
}
.image-thumbnail {
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: transform 0.2s;
}
.image-thumbnail:hover {
  transform: scale(1.1);
}
.card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 10px;
}
</style>


<script>
import { ref, onMounted } from 'vue';
import { auth, db } from '@/firebase/firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { reauthenticateWithCredential, EmailAuthProvider, updateEmail, updatePassword } from 'firebase/auth';

export default {
  setup() {
    const user = ref(null);
    const profileImage = ref('');
    const defaultProfileImage = new URL('@/assets/default-avatar.png', import.meta.url).href;
    const profileImages = ref([
      new URL('@/assets/2d.jpg', import.meta.url).href,
      new URL('@/assets/murdoc.webp', import.meta.url).href,
      new URL('@/assets/noodle.webp', import.meta.url).href,
      new URL('@/assets/russel.webp', import.meta.url).href,
    ]);
    const showImageSelection = ref(false);
    const currentPassword = ref('');
    const newEmail = ref('');
    const newPassword = ref('');
    const posts = ref([]);
    const newPostTitle = ref('');
    const newPostContent = ref('');

    const loadUserPosts = async () => {
      if (user.value) {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        posts.value = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(post => post.userId === user.value.uid);  
      }
    };

    const loadProfileImageFromLocalStorage = () => {
      const storedImage = localStorage.getItem('profileImage');
      if (storedImage) {
        profileImage.value = storedImage;
      } else {
        profileImage.value = defaultProfileImage;
      }
    };

    const selectProfileImage = (image) => {
      profileImage.value = image;
    };

    const saveProfileImage = () => {
      if (!profileImage.value) return;

      try {
        localStorage.setItem('profileImage', profileImage.value);
        alert('Imagen de perfil guardada en el navegador.');
        showImageSelection.value = false;

     
        window.dispatchEvent(new Event('profileImageUpdated'));
      } catch (error) {
        console.error('Error al guardar la imagen de perfil:', error);
      }
    };

    const reauthenticateAndUpdate = async () => {
      const credentials = EmailAuthProvider.credential(user.value.email, currentPassword.value);
      
      try {
        await reauthenticateWithCredential(user.value, credentials);

   
        if (newEmail.value) {
          await updateEmail(user.value, newEmail.value);
          alert('Correo actualizado correctamente.');
        }


        if (newPassword.value) {
          await updatePassword(user.value, newPassword.value);
          alert('Contraseña actualizada correctamente.');
        }
        
  
        currentPassword.value = '';
        newEmail.value = '';
        newPassword.value = '';
      } catch (error) {
        console.error('Error en la reautenticación o actualización:', error);
        alert('Error al actualizar la información.');
      }
    };


    const createPost = async () => {
      if (newPostTitle.value && newPostContent.value) {
        try {
          await addDoc(collection(db, 'posts'), {
            title: newPostTitle.value,
            content: newPostContent.value,
            userId: user.value.uid,
            date: new Date().toISOString(),
          });
          newPostTitle.value = '';
          newPostContent.value = '';
          loadUserPosts();  
        } catch (error) {
          console.error('Error al crear la publicación:', error);
        }
      }
    };


    const editPost = async (post) => {
      const newTitle = prompt('Nuevo título:', post.title);
      const newContent = prompt('Nuevo contenido:', post.content);
      if (newTitle && newContent) {
        try {
          const postRef = doc(db, 'posts', post.id);
          await updateDoc(postRef, {
            title: newTitle,
            content: newContent,
            date: new Date().toISOString(),
          });
          loadUserPosts(); 
        } catch (error) {
          console.error('Error al editar la publicación:', error);
        }
      }
    };

   
    const deletePost = async (postId) => {
      if (confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
        try {
          await deleteDoc(doc(db, 'posts', postId));
          loadUserPosts();  
        } catch (error) {
          console.error('Error al eliminar la publicación:', error);
        }
      }
    };


    auth.onAuthStateChanged(currentUser => {
      if (currentUser) {
        user.value = currentUser;
        loadUserPosts();  
        loadProfileImageFromLocalStorage();  
      } else {
        user.value = null;
        posts.value = []; 
      }
    });

    return {
      user,
      profileImage,
      profileImages,
      defaultProfileImage,
      showImageSelection,
      currentPassword,
      newEmail,
      newPassword,
      posts,
      newPostTitle,
      newPostContent,
      createPost,
      editPost,
      deletePost,
      selectProfileImage,
      saveProfileImage,
      reauthenticateAndUpdate,
    };
  },
};
</script>


<style scoped>
.profile {
  border-radius: 0.75rem;
  background-color: #f8f9fa;
  padding: 2rem;
}

.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
}

.image-thumbnail {
  width: 75px;
  height: 75px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-thumbnail:hover {
  transform: scale(1.1);
}

.badge {
  font-size: 1rem;
}

.profile {
  margin-top: 20px;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card {
  background-color: #d4247b;
  border: none;
  color: white;
}

.card input {
  background-color: rgba(255, 255, 255, 0.39);
  border: none;
}






</style>
