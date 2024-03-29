import { Component, OnInit, OnDestroy } from '@angular/core';
//import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { AppState } from '../../../interfaces';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { getAuthStatus } from '../../reducers/selectors';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {
  signUpForm: FormGroup;
  formSubmit = false;
  title = environment.AppName;
  registerSubs: Subscription;

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private authService: AuthService
  ) {
    this.redirectIfUserLoggedIn();
  }

  ngOnInit() {
    this.initForm();
  }

  onSubmit() {
    const values = this.signUpForm.value;
    const keys = Object.keys(values);
    this.formSubmit = true;
    if (this.signUpForm.valid) {
      console.log (this.signUpForm);
      this.registerSubs = this.authService.register(values).subscribe(data => {
        const errors = data;
        console.log (data);
        if (errors) {
          keys.forEach(val => {
            if (errors[val]) { this.pushErrorFor(val, errors[val][0]); };
          });
        }
      });
    } else {
      keys.forEach(val => {
        const ctrl = this.signUpForm.controls[val];
        if (!ctrl.valid) {
          this.pushErrorFor(val, null);
          ctrl.markAsTouched();
        };
      });
    }
  }

  private pushErrorFor(ctrl_name: string, msg: string) {
    this.signUpForm.controls[ctrl_name].setErrors({'msg': msg});
  }

  initForm() {
    const email = '';
    const first_name = '';
    const last_name = '';
    const username = '';
    const password1 = '';
    const password2 = '';
    const phone = '';
    const address = '';

    this.signUpForm = this.fb.group({
        'email': [email, Validators.compose([Validators.required, Validators.email]) ],
        'password1': [password1, Validators.compose([Validators.required, Validators.minLength(8)]) ],
        'password2': [password2, Validators.compose([Validators.required, Validators.minLength(8)]) ],
        'phone': [phone, Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(11),Validators.pattern('[0-9]{11}')]) ],
        'first_name': [first_name],
        'last_name': [last_name],
        'username': [username, Validators.required],
        'address': [address],
      },{validator: this.matchingPasswords('password1', 'password2')}
    );
  }

  redirectIfUserLoggedIn() {
    this.store.select(getAuthStatus).subscribe(
      data => {
        if (data === true) { this.router.navigateByUrl('/'); }
      }
    );
  }

  ngOnDestroy() {
    if (this.registerSubs) { this.registerSubs.unsubscribe(); }
  }

  matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let password = group.controls[passwordKey];
      let confirmPassword = group.controls[confirmPasswordKey];

      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }



}
