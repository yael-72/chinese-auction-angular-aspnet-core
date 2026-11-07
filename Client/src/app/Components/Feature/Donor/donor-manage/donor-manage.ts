
import { Component, inject, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Donor } from '../../../../model/donor.model';
import { DonorService } from '../../../../services/donor-service';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-donor-manage',
  imports: [TableModule, TagModule, IconFieldModule, Dialog, InputTextModule, InputIconModule, MultiSelectModule, SelectModule, HttpClientModule, CommonModule, ButtonModule, ConfirmDialog, ReactiveFormsModule, FormsModule, TooltipModule],
  templateUrl: './donor-manage.html',
  styleUrl: './donor-manage.scss',
  providers:[ConfirmationService,MessageService],
})
export class DonorManage implements OnInit {
    private donorSrv: DonorService = inject(DonorService);
    list$: Donor[] = [];
    private router = inject(Router);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    loading: boolean = true;
    updateDialog = false;
    searchName: string = '';
    isEditMode: boolean = false;

    donorForm: FormGroup = new FormGroup({
      name: new FormControl('', [Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
      email: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('', [Validators.required])
    });

    ngOnInit(): void {
      this.loadDonors();
      this.loading = false;
    }

    loadDonors(): void {
      this.donorSrv.getAll().subscribe({
        next: (data: Donor[]) => {
          this.list$ = data;
        },
        error: (error) => {
          console.error('Error loading donors:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to load donors', 
            life: 3000 
          });
        }
      });
    }

    searchDonorByName(name: string): void {
        this.searchName = name;
        this.performSearch();
    }

    performSearch(): void {
        if (this.searchName && this.searchName.trim()) {
            this.donorSrv.searchByName(this.searchName.trim()).subscribe({
                next: (data: Donor[]) => {
                    this.list$ = data;
                },
                error: (error) => {
                    console.error('Search error:', error);
                    this.messageService.add({ 
                      severity: 'error', 
                      summary: 'Error', 
                      detail: 'Search failed', 
                      life: 3000 
                    });
                }
            });
        } else {
            this.loadDonors();
        }
    }

    resetSearch(): void {
        this.searchName = '';
        this.loadDonors();
    }

    clear(table: Table): void {
        table.clear();
    }

    // getSeverity(status: string) {
    //     switch (status) {
    //         case 'unqualified':
    //             return 'danger';

    //         case 'qualified':
    //             return 'success';

    //         case 'new':
    //             return 'info';

    //         case 'negotiation':
    //             return 'warn';

    //         case 'renewal':
    //             return null;
    //     }
    // }

    getGifts(name: string): void {
      this.router.navigate(["/gift"], { queryParams: { donorName: name } });
    }

    openNew(): void {
      this.isEditMode = false;
      this.donorForm.reset();
      this.updateDialog = true;
    }

    editDonor(donor: Donor): void {
      this.isEditMode = true;
      this.donorForm.patchValue({
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        country: donor.country
      });
      this.updateDialog = true;
    }

    deleteDonor(donor: Donor): void {
      this.confirmationService.confirm({
        message: `?${donor.name} האם אתה בטוח שברצונך למחוק את`,
        header: 'אזהרה',
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: 'לא',
          severity: 'secondary',
          variant: 'text'
        },
        acceptButtonProps: {
          severity: 'danger',
          label: 'כן'
        },
        accept: () => {
          this.donorSrv.delete(donor.id).subscribe({
            next: (res: any) => {
              this.loadDonors();
              const detail = res?.message ?? 'Donor deleted successfully';
              this.messageService.add({ 
                severity: 'success', 
                summary: 'Success', 
                detail, 
                life: 3000 
              });
            },
            error: (err: any) => {
              const detail = err?.error?.message ?? 'Could not delete donor';
              this.messageService.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail, 
                life: 3000 
              });
            }
          });
        }
      });
    }

    saveDonor(): void {
      if (!this.donorForm.valid) {
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Validation Error', 
          detail: 'Please fill in all required fields correctly', 
          life: 3000 
        });
        return;
      }

      const formValue = this.donorForm.getRawValue();
      const donorData: Donor = {
        ...formValue,
        gifts: []
      };

      if (this.isEditMode) {
        // Get the ID from the current list - we can find it by email as unique identifier
        const currentDonor = this.list$.find(d => d.email === formValue.email);
        if (currentDonor) {
          donorData.id = currentDonor.id;
        }

        this.donorSrv.update(donorData).subscribe({
          next: () => {
            this.hideDialog();
            this.loadDonors();
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Donor updated successfully', 
              life: 3000 
            });
          },
          error: (err: any) => {
            const detail = err?.error?.message ?? 'Could not update donor';
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail, 
              life: 3000 
            });
          }
        });
      } else {
        this.donorSrv.add(donorData).subscribe({
          next: () => {
            this.hideDialog();
            this.loadDonors();
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: 'Donor added successfully', 
              life: 3000 
            });
          },
          error: (err: any) => {
            const detail = err?.error?.message ?? 'Could not add donor';
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail, 
              life: 3000 
            });
          }
        });
      }
    }

    hideDialog(): void {
      this.updateDialog = false;
      this.donorForm.reset();
      this.isEditMode = false;
    }
}
