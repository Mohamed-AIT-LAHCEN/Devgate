<template>
    <div>
        <p class="titre"> Gestion des Compétences</p>
        <div class="comps" v-for="(compe,i) in listCompetence" :key="i">
            <p>Titre : {{ compe.titre }}</p>
            <p>Niveau : {{ compe.niveau }}</p>
            <p>Date d'acquisition : {{ compe.date_acquisition }}</p>
            <p>Date de progression : {{ compe.date_progression }}</p>
        </div>
        <div class="form-group">
                <label for="comp">Ajouter une compétence : </label>
                <button type="submit" class="btn btn-success" @click="ajouter()">Ajouter </button>

            </div>
        <form @submit.prevent = "addComp" v-if="val">

            <div class="ajout" id="ajout" :style="{ display: val ? 'block' : 'none' }">
            <div class="form-group">
                <label for="titre">	Titre (ex : React, Git, Docker…)</label>
                <input type="text" v-model="titre" required>

            </div>
            <div class="form-group">
                <label for="niveau">	Choisir un niveau (Débutant, Intermédiaire, Avancé)</label>
                <input type="text" v-model="niveau" required>

            </div>
            <div class="form-group">
                <label for="date">		Ajouter une date d'acquisition</label>
                <input type="date" v-model="dateac" required>

            </div>
            <div class="form-group">
                <label for="date">		Ajouter une date progression</label>
                <input type="date" v-model="datepr" required>

            </div>
            <button type="submit" >Submit</button>  
        </div> 
        </form>


    </div>
    </template>
    
    <script>
    import {ref,onMounted} from 'vue'
    import {db} from '../firebase'
    import {addDoc,collection,getDocs} from 'firebase/firestore' 
    export default {
        name:'Gest-Comp',
        setup() {
            const titre = ref("")

            const niveau = ref("")
            const dateac = ref("")
            const datepr = ref("")
            const val=ref(false)
            const listCompetence=ref([])
            const ajouter = () => {
                val.value = !val.value;
            };
            const addComp= async () => {
                    await addDoc(collection(db,"Compétence"),{
                        titre : titre.value,
                        niveau : niveau.value,
                        date_acquisition : dateac.value,
                        date_progression : datepr.value,

                    })
                    titre.value="";
                    niveau.value="";
                    dateac.value="";
                    datepr.value="";
                    val.value=false;
            }
            const getData=async()=>{
                const listComp=await getDocs(collection(db,"Compétence"))
                listComp.forEach((comp)=>{
                    listCompetence.value.push(comp.data());
                })
            }
            onMounted(() => {
                getData();
            });

            return {
                titre,
                niveau,
                dateac,
                datepr,
                ajouter,
                addComp,
                val,
                listCompetence
            }
        }
    }
    </script>
 <style>
.titre{
    color: red;
    font-size: 20px;
    font-weight: bold
}
.btn{
    font-size: small;
    margin-left: 5px;
}
.form-group{
    margin-bottom: 10px;
}
.ajout{
    display: none;
}
.comps{
    border: 1px solid green;
}

</style>