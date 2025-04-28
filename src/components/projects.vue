<template>
<div>
    <form @submit.prevent = "addProject">
        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" v-model="title" required>
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <textarea v-model="description" required>
            </textarea>
        </div>
        <div class="form-group">
            <label for="stack">Stack utilisés</label>
            <button type="button" @click="addStack" class="btn btn-success">Add Stack</button>
            <div v-for="(stack, i) in stacks" :key="i">
                <input type="text" v-model="stack" placeholder="add stack" required>
            </div>
        </div>
        <div class="form-group">
            <label for="github">Lien github</label>
            <input type="text" v-model="github" required>
        </div>
    </form>
</div>
</template>

<script>
import {db} from '../firebase'
import { addDoc, collection } from 'firebase/firestore';
import {ref} from 'vue'
export default {
    setup() {

    }
}

</script>