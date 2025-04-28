<template>
<div>
    <RouterLink to="/">Home</RouterLink>
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
                <input type="text" v-model="stacks[i]" placeholder="add stack" required>
            </div>
        </div>
        <div class="form-group">
            <label for="github">Lien github</label>
            <input type="text" v-model="github" required>
        </div>
        <button type="submit" class="btn btn-success">Submit</button>
    </form>
</div>
</template>

<script>
import {db} from '../firebase'
import { addDoc, collection } from 'firebase/firestore';
import {ref} from 'vue'
export default {
    name: 'pro-ject',
    setup() {
        const title = ref("")
        const description = ref("")
        const stacks = ref([])
        const github = ref("")
        const addStack = () => {
            stacks.value.push("");
        }
        const addProject = async () => {
            await addDoc(collection(db, 'projects'), {
                title: title.value,
                description: description.value,
                stacks: stacks.value,
                github: github.value
            })
            title.value = ""
            description.value = ""
            stacks.value = []
            github.value = ""
        }
        return {
            title,
            description,
            stacks,
            github,
            addStack,
            addProject
        }
    }
}

</script>