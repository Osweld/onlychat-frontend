import { Routes } from "@angular/router";
import { ChatPageComponent } from "./pages/chat-page/chat-page.component";
import { ConfigurationComponent } from "./pages/configuration/configuration.component";

export const chatRoutes: Routes = [
    {
        path: '',
        component: ChatPageComponent,
        title: 'Chat | OnlyChat'
    },
    {
        path: '**',
        redirectTo: '', 
        pathMatch: 'full'
    }
];
