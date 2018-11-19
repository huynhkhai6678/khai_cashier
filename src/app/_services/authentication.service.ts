import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private httpOptions;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        console.log(email + password);
        let param = { email: email, password: password };
        return this.http.post(`${environment.apiUrl}/user/cashier/login`, { email, password })
            .pipe(map(response => {
                //login successful if there's a jwt token in the response
                if (response && response['tokenId']) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(response['tokenId']));
                    this.currentUserSubject.next(response['tokenId']);
                }

                return response;
            }));
        // return this.http.post(`${environment.apiUrl}/user/cashier/login`, param, { headers: hdrs, observe: 'response' }).subscribe(res => {
        //     console.log(res);
        //     console.log(res.headers.get('X-Powered-By'));
        //   });        
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}