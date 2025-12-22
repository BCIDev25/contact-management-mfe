import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormConfig } from '@ai-solutions-ui/form-component';
import { RemoteComponent } from '../../components/remote-component';
import { ContactStaffService } from '../services/contact-staff-service';
import { environment } from '../../../environments/environment';
import { DropdownOption, IAppMessageService } from '../../models/contact';

@Component({
    selector: 'app-contact-staff-security',
    standalone: true,
    imports: [RemoteComponent],
    templateUrl: './contact-staff-security-component.html',
    styleUrls: ['./contact-staff-security-component.scss'],
})
export class ContactStaffSecurityComponent implements OnInit {

    //#region INJECTED DEPENDECIES
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private staffService = inject(ContactStaffService);

    constructor(
        @Inject('MESSAGING_SERVICE')
        public messageService: IAppMessageService,
    ) { }
    //#endregion

    //#region SIGNALS - UI STATE MANAGEMENT
    
    // Dropdown options
    departmentOpts = signal<DropdownOption[]>([]);
    
    // UI loading states
    uniqId = signal<number | null>(null);
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    
    // Configuration & Environment
    uiMfeUrl = environment.uiMfeUrl;
    //#endregion

    //#region FORM CONFIGURATION

    private readonly formFields = [
        {
            key: 'staffName',
            label: 'Name',
            type: 'text' as const,
            icon: 'pi-id-card',
            disabledWhen: () => true,
        },
        {
            key: 'loginId',
            label: 'Login ID',
            type: 'text' as const,
            icon: 'pi-user',
        },
        {
            key: 'password',
            label: 'New Password',
            type: 'password' as const,
            icon: 'pi pi-lock',
        },
        {
            key: 'confirmPassword',
            label: 'Confirm Password',
            type: 'password' as const,
            icon: 'pi pi-lock',
        }
    ];

    private formConfigSignal = signal<FormConfig>({
        title: 'Security',  
        fields: this.formFields,
        model: {
            staffName: '',
            loginId: '',
            password: '',
            confirmPassword: '',
        },
        buttonLabel: 'Save Changes',
    });

    formConfig = this.formConfigSignal.asReadonly();
    //#endregion
    
    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = Number(params['id']);
            
            if (isNaN(id) || id <= 0) {
                this.messageService.showError('Error', 'Invalid Staff ID');
                this.router.navigate(['/contact/staff/list']);
                return;
            }
            
            this.uniqId.set(id);
            this.loadInitialFormData(id);
        });
    }

    //#region INITIALIZATION & DATA LOAD

    private loadInitialFormData(id: number): void {
        this.loading.set(true);        
        this.loadStaff(id);
    }

    private loadStaff(id: number): void {
        this.loading.set(true);
        
        this.staffService.getStaffById(id).subscribe({
            next: (staff) => {
                this.handleStaffLoaded(staff);
            },
            error: (err) => {
                this.messageService.showError(
                    'Error', 
                    err.error?.error || err.message || 'Failed to load staff'
                );
                this.loading.set(false);
                this.router.navigate(['/contact/staff/list']);
            }
        });
    }

    private handleStaffLoaded(staff: Record<string, any>): void {
        this.setFormModel(staff);
        this.loading.set(false);
    }

    private setFormModel(staff: Record<string, any>): void {
        this.formConfigSignal.update(cfg => ({
            ...cfg,
            title: 'Security',
            model: { ...staff }
        }));
    }

    //#endregion

    //#region EVENT HANDLERS

    onRemoteOutput(event: Record<string, any>): void {
        if (event['modelChange']) { }

        if (event['formButtonClicked']) {
            this.updateStaffSecurity(event['formButtonClicked']);
        }
    }

    //#endregion

    //#region API DATA LOADING METHODS
    //#endregion
    
    //#region FORM SUBMISSION & STAFF SECURITY UPDATE

    updateStaffSecurity(model: Record<string, any>): void {
        const id = this.uniqId();
        if (!id) {
            this.messageService.showError('Error', 'Staff ID is missing');
            return;
        }

        // Validate passwords
        if (!this.validatePasswords(model)) {
            return;        
        }

        const payload = this.buildPayload(model);

        this.saving.set(true);
        
        this.staffService.updateStaffSecurity(id, payload).subscribe({
            next: () => {
                this.messageService.showSuccess('Success', 'Security settings updated successfully!');
                this.clearPasswordFields();
                this.saving.set(false);
            },
            error: (err) => {
                this.messageService.showError(
                    'Error', 
                    err.error?.message || 'Failed to update security settings'
                );
                this.saving.set(false);
            }
        });
    }

    private validatePasswords(model: Record<string, any>): boolean {
        const password = model['password'];
        const confirmPassword = model['confirmPassword'];

        // If password are filled
        if (password || confirmPassword) {
            if (password != confirmPassword) {
                this.messageService.showError('Error', 'Passwords do not match');
                return false;
            }

            if (password.length < 8) {
                this.messageService.showError('Error', 'Password must be at least 8 characters');
                return false;
            }
            // Optional
            // const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
            // if (!strongPasswordRegex.test(password)) {
            //     this.messageService.showError(
            //     'Error', 
            //     'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            //     );
            //     return false;
            // }
        }
        return true;
    }

    private buildPayload(model: Record<string, any>): Record<string, any> {
        const payload: Record<string, any> = {
            loginId: model['loginId'],
        };

        if (model['password'] && model['password'].trim() !== '') {
            payload['password'] = model['password'];
        }
        return payload;
    }

    private clearPasswordFields(): void {
        this.formConfigSignal.update(cfg => ({
            ...cfg,
            model: {
                ...cfg.model,
                password: '',
                confirmPassword: '',
            }
        }));
    }

    //#endregion

    //#region FORM MANIPULATION HELPERS
    //#endregion
  
    //#region UTILITY METHODS

    //#endregion

}