<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h2>Crear Nueva Publicación</h2>
          </div>
          <div class="card-body">
            <div v-if="!isAuthenticated" class="alert alert-warning">
              No estás autenticado. Inicia sesión para crear una publicación.
            </div>
            <form v-if="isAuthenticated" @submit.prevent="createPost">
             
              <div class="mb-3">
                <label for="title" class="form-label">Título</label>
                <input
                  v-model="title"
                  id="title"
                  type="text"
                  class="form-control"
                  placeholder="Escribe el título de tu publicación"
                  required
                />
              </div>

             
              <div class="mb-3">
                <label for="content" class="form-label">Contenido</label>
                <textarea
                  v-model="content"
                  id="content"
                  class="form-control"
                  rows="5"
                  placeholder="Escribe el contenido de tu publicación"
                  required
                ></textarea>
              </div>

          
              <div class="mb-3">
                <label for="album" class="form-label">Selecciona un Álbum</label>
                <div class="d-flex justify-content-start flex-wrap ">
                  <div
                    v-for="album in albums"
                    :key="album.id"
                    class="album-card mx-2"
                    :class="{ 'selected': selectedAlbum === album.id }"
                    @click="selectAlbum(album.id)"
                  >
                    <img
                      :src="album.image"
                      class="card-img-top"
                      :alt="album.name"
                      style="width: 200px; height: auto;"
                    />
                    <div class="card-body text-center">
                      <h5 class="card-title">{{ album.name }}</h5>
                    </div>
                  </div>
                </div>
             
                <div v-if="albumError" class="text-danger mt-2">
                  Debes seleccionar un álbum antes de publicar.
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100">
                Publicar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { auth, db } from '@/firebase/firebaseConfig'; 
import { collection, addDoc } from 'firebase/firestore';

export default {
  setup() {
    const title = ref('');
    const content = ref('');
    const isAuthenticated = ref(false); 
    const selectedAlbum = ref(null); 
    const albumError = ref(false); 

   
    const albums = ref([
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
    ]);

  
    onMounted(() => {
      auth.onAuthStateChanged((user) => {
        isAuthenticated.value = !!user; 
      });
    });


    const selectAlbum = (albumId) => {
      selectedAlbum.value = albumId;
      albumError.value = false; 
    };

    const createPost = async () => {
  if (!selectedAlbum.value) {
    albumError.value = true; 
    return; 
  }
  try {
    const user = auth.currentUser; 
    await addDoc(collection(db, 'posts'), {
      title: title.value,
      content: content.value,
      albumId: selectedAlbum.value, 
      userId: user.uid, 
      userPhoto: user.photoURL, 
      createdAt: new Date(),
    });
    alert('Publicación creada con éxito');
  
    title.value = '';
    content.value = '';
    selectedAlbum.value = null; 
  } catch (error) {
    console.error('Error al crear publicación:', error);
  }
};


    return { title, content, createPost, isAuthenticated, albums, selectedAlbum, selectAlbum, albumError };
  },
};



</script>

<style scoped>
.container {
  max-width: 800px;
}
.card {
  margin-bottom: 30px;
  background-color: rgb(212, 36, 123); 
  border: none;
  color: white;
}

textarea, input {
  background-color: rgba(255, 255, 255, 0.39); 
  border: none;
}

.album-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.album-card:hover {
  transform: scale(1.05);
}
.album-card.selected {
  border: 2px solid #007bff;
}
.card-img-top {
  width: 100%;
  height: auto;
}
.text-danger {
  font-size: 0.875rem;
}
</style>
