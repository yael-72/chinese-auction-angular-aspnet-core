import { Router, RouterModule } from '@angular/router';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { Menu } from 'primeng/menu';
import { Authservice } from '../../services/authservice';
import { User } from '../../model/user.model';
import { CommonModule } from '@angular/common';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [RouterModule, Menubar, Menu, CommonModule],
    templateUrl: './navigation.html',
    styleUrl: './navigation.scss',
})
export class Navigation implements OnInit {

    items: MenuItem[] | undefined;
    userMenuItems: MenuItem[] | undefined;

    @ViewChild('profileMenu') profileMenu!: Menu;

    authSrv: Authservice = inject(Authservice)
    loggedIn: boolean = false
    user: User | null = null
    router=inject(Router)

    ngOnInit() {
        combineLatest([
            this.authSrv.loggedIn,
            this.authSrv.user
        ]).subscribe(([loggedIn, user]) => {
            this.loggedIn = loggedIn;
            this.user = user;
            this.buildNav();
        });
    }

    buildNav() {
        
        this.items = !this.loggedIn ? [
            {
                label: 'הירשם',
                icon: 'pi pi-user-plus',
                routerLink: '/register'
            },
            {
                label: 'היכנס',
                icon: 'pi pi-sign-in',
                routerLink: '/login'
            },
            {
                label: 'מתנות',
                icon: 'pi pi-gift',
                routerLink: '/gift'
            }]
            : this.user?.role == "Admin" ? [
                {
                    label: 'תורמים',
                    icon: 'pi pi-users',
                    routerLink: '/donor'
                }, 
                {
                    label: 'מתנות',
                    icon: 'pi pi-gift',
                    routerLink: '/gift'},
                {
                    label: 'ניהול מתנות',
                    icon: 'pi pi-cog',
                    routerLink: '/gift-manage'
                }]
                : [{
                    label: 'מתנות',
                    icon: 'pi pi-gift',
                    routerLink: '/gift'
                },
                {
                    label: 'סל',
                    icon: 'pi pi-shopping-cart',
                    routerLink: '/basket'
                }
                ];
        
        // User profile menu (appears on hover)
        this.userMenuItems = [
            {
                label: 'התנתק',
                icon: 'pi pi-sign-out',
                command: () => {this.authSrv.logout();this.router.navigate(['/'])}
            }
        ];
    }

    toggleUserMenu(event: any) {
        this.profileMenu.toggle(event);
    }

    navigateHome() {
        this.router.navigate(['/']);
    }
}

