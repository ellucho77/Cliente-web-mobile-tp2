<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <form @submit.prevent="handleSubmit" class="card p-4 shadow-sm">
          <h2 class="mb-4 text-center">{{ isLogin ? 'Iniciar Sesión' : 'Registro' }}</h2>

         
          <div class="mb-3">
            <label for="email" class="form-label">Correo Electrónico</label>
            <input
              v-model="email"
              type="email"
              id="email"
              class="form-control"
              :class="{ 'is-invalid': emailError }"
              required
            />
            <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
          </div>

         
          <div class="mb-3">
            <label for="password" class="form-label">Contraseña</label>
            <input
              v-model="password"
              type="password"
              id="password"
              class="form-control"
              :class="{ 'is-invalid': passwordError }"
              required
            />
            <div v-if="passwordError" class="invalid-feedback">{{ passwordError }}</div>
          </div>

       
          <div v-if="!isLogin" class="mb-3">
            <label for="profileImage" class="form-label">Foto de Perfil</label>
            <select
              v-model="profileImage"
              id="profileImage"
              class="form-control"
              required
            >
              <option value="" disabled>Selecciona una foto</option>
              <option value="/assets/2d.jpg">2D</option>
              <option value="/assets/murdoc.jpg">Murdoc</option>
              <option value="/assets/noodle.jpg">Noodle</option>
              <option value="/assets/russel.jpg">Russel</option>
            </select>
          </div>

         
          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isLogin ? 'Iniciar Sesión' : 'Registrar' }}
          </button>

         
          <button
            type="button"
            class="btn btn-link mt-3 w-100"
            @click="toggleMode"
          >
            {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
          </button>
        </form>

       
        <div v-if="message" :class="['alert mt-3', messageType]" role="alert">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { auth } from '@/firebase/firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '@/firebase/firebaseConfig'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const profileImage = ref(''); 
    const isLogin = ref(true);
    const isLoading = ref(false);
    const message = ref('');
    const messageType = ref('alert-success');
    const emailError = ref('');
    const passwordError = ref('');

    const validateInputs = () => {
      emailError.value = '';
      passwordError.value = '';

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value)) {
        emailError.value = 'Por favor, ingresa un correo válido.';
      }
      if (password.value.length < 6) {
        passwordError.value = 'La contraseña debe tener al menos 6 caracteres.';
      }

      return !emailError.value && !passwordError.value;
    };

    const handleSubmit = async () => {
      if (!validateInputs()) return;

      isLoading.value = true;
      message.value = '';

      try {
        if (isLogin.value) {
         
          await signInWithEmailAndPassword(auth, email.value, password.value);
          message.value = 'Sesión iniciada con éxito.';
          messageType.value = 'alert-success';
        } else {
          
          const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
          const userId = userCredential.user.uid;

         
          const userDocRef = doc(db, 'users', userId);
          await setDoc(userDocRef, {
            email: email.value,
            profileImage: profileImage.value,
            timestamp: serverTimestamp(),
          });

          message.value = 'Usuario registrado con éxito.';
          messageType.value = 'alert-success';
        }
      } catch (error) {
        console.error('Error de autenticación:', error);
        message.value = 'Error de autenticación: ' + error.message;
        messageType.value = 'alert-danger';
      } finally {
        isLoading.value = false;
        setTimeout(() => (message.value = ''), 3000);
      }
    };

    const toggleMode = () => {
      isLogin.value = !isLogin.value;
      profileImage.value = ''; 
    };

    return {
      email,
      password,
      profileImage,
      isLogin,
      isLoading,
      message,
      messageType,
      handleSubmit,
      toggleMode,
      emailError,
      passwordError,
    };
  },
};

</script>

<style scoped>
.card {
  background-color: #d4247b;
  border: none;
  color: white;
}

.card input,
.card select {
  background-color: rgba(255, 255, 255, 0.39);
  border: none;
  color: white;
}

.card input.is-invalid,
.card select.is-invalid {
  border: 1px solid #dc3545;
}

.invalid-feedback {
  color: #dc3545;
}

.spinner-border {
  vertical-align: middle;
}

</style>
