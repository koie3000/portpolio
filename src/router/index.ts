import {createMemoryHistory, createRouter, createWebHistory} from 'vue-router';
import { routes } from './routes';
import { isSSR } from '../util/environment';

export default function createVueRoute () {
    return createRouter({
        history: isSSR() ? createMemoryHistory() : createWebHistory(),
        routes: routes
      });
}