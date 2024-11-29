<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-black w-100 mb-4">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <img src="@/assets/logo-1.png" alt="Logo" />
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to="/profile" v-if="user" class="nav-link text-light">
                Perfil
              </router-link>
            </li>
          </ul>
          <div class="d-flex align-items-center">
          
            <img
              v-if="user"
              :src="profileImage || defaultProfileImage"
              alt="Foto de perfil"
              class="profile-image me-2"
            />
            <button
              v-if="user"
              @click="logout"
              class="btn btn-outline-danger me-2"
            >
              Cerrar Sesión
            </button>
            <button
              v-else
              @click="showAuthForm = true"
              class="btn btn-outline-success"
            >
              Iniciar Sesión / Registrarse
            </button>
          </div>
        </div>
      </div>
    </nav>

    <AuthForm v-if="showAuthForm" @close="showAuthForm = false" />

    <router-view />
  </div>
</template>

<script>
import { auth } from './firebase/firebaseConfig';
import AuthForm from './components/AuthForm.vue';

export default {
  components: {
    AuthForm,
  },
  data() {
    return {
      showAuthForm: false,
      user: null,
      profileImage: '', 
      defaultProfileImage: new URL('@/assets/default-avatar.png', import.meta.url).href,
    };
  },
  created() {
    auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        this.user = currentUser;
      } else {
        this.user = null;
      }

      this.loadProfileImage();
    });

    window.addEventListener('profileImageUpdated', this.loadProfileImage);
  },
  methods: {
    async logout() {
      await auth.signOut();
      this.user = null;
      this.profileImage = this.defaultProfileImage;
    },
    loadProfileImage() {
      const storedImage = localStorage.getItem('profileImage');
      this.profileImage = storedImage || this.defaultProfileImage;
    },
  },
  beforeDestroy() {
    window.removeEventListener('profileImageUpdated', this.loadProfileImage);
  },
};
</script>


<style scoped>

nav.navbar {
  width: 100%;
  background-color: #000000;
  color: white;
}

.nav-link {
  color: white !important;
}


.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}
</style>
