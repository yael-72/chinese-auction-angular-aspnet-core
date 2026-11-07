import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FileUpload } from 'primeng/fileupload';
import { SelectModule } from 'primeng/select';
import { RadioButton } from 'primeng/radiobutton';
import { Rating } from 'primeng/rating';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table } from 'primeng/table';
import { Gift } from '../../../../model/gift.model';
import { GiftCrud } from '../../../../services/gift-crud';
import { Donor } from '../../../../model/donor.model';
import { DonorService } from '../../../../services/donor-service';
import { Catergory } from '../../../../model/category.model';
import { Categoryservice } from '../../../../services/categoryservice';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SystemMessageService } from '../../../shared/system-message/system-message.component';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-gift-manage',
    templateUrl: './gift-manage.html',
    standalone: true,
    imports: [TableModule, Dialog, SelectModule, CommonModule, ConfirmPopup, ConfirmDialogModule, ToastModule, ToolbarModule, InputTextModule, TextareaModule, CommonModule, FileUpload, InputTextModule, FormsModule, ReactiveFormsModule, InputNumber, IconFieldModule, InputIconModule, ButtonModule],
    providers: [ConfirmationService],
    styles: [
        `:host ::ng-deep .p-dialog .Gift-image {
            width:80%;
            max-width: 420px;
            height: 145px;
            object-fit: cover;
            border-radius: 8px;
            margin: 0 auto 1rem auto;
            display: block;
        }`
    ]
})
export class GiftManage implements OnInit {
    GiftDialog: boolean = false;
    categoryDialog: boolean = false;
    isEditMode: boolean = false;
    editingGiftId: number | null = null;
    private donorSrv = inject(DonorService);
    private categorySrv = inject(Categoryservice);
    private GiftService = inject(GiftCrud);
    private systemMessageService = inject(SystemMessageService);
    private confirmationService = inject(ConfirmationService);
    private cd = inject(ChangeDetectorRef);

    Gifts!: Gift[];
    donors: Donor[] = [];
    categories: Catergory[] = [];

    selectedGifts!: Gift[] | null;

    categoryName: string = '';
    searchName: string = '';
    searchDonor: string = '';
    searchBuyers: number | null = null;

    giftForm: FormGroup = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      price: new FormControl('', [Validators.required, Validators.min(0.01)]),
      image: new FormControl('', [Validators.required]),
      donor: new FormControl(null, [Validators.required]),
      category: new FormControl(null, [Validators.required])
    });

    @ViewChild('dt') dt!: Table;

    cols!: Column[];

    exportColumns!: ExportColumn[];

    exportCSV(): void {
        this.dt.exportCSV();
    }

    ngOnInit(): void {
        this.loadDemoData();
    }

    loadDemoData(): void {
        this.GiftService.getAll().subscribe((data) => {
            this.Gifts = data;
            this.cd.markForCheck();
        });

        // this.statuses = [
        //     { label: 'INSTOCK', value: 'instock' },
        //     { label: 'LOWSTOCK', value: 'lowstock' },
        //     { label: 'OUTOFSTOCK', value: 'outofstock' }
        // ];

        this.cols = [
            { field: 'id', header: 'Id', customExportHeader: 'Gift Code' },
            { field: 'name', header: 'Name' },
            { field: 'image', header: 'Image' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    searchGiftByName(name: string): void {
        this.searchName = name;
        this.performSearch();
    }

    searchGiftByDonor(donor: string): void {
        this.searchDonor = donor;
        this.performSearch();
    }

    searchGiftByBuyers(buyers: number | null): void {
        this.searchBuyers = buyers;
        this.performSearch();
    }

    resetFilters(): void {
        this.searchName = '';
        this.searchDonor = '';
        this.searchBuyers = null;
        this.loadDemoData();
    }

    performSearch(): void {
        const hasSearchParams = (this.searchName && this.searchName.trim()) || 
                                this.searchDonor || 
                                this.searchBuyers;

        if (hasSearchParams) {
            const name = this.searchName ? this.searchName.trim() : null;
            const donor = this.searchDonor ? this.searchDonor.trim() : null;
            const buyers = this.searchBuyers ? this.searchBuyers : null;

            this.GiftService.getAll(name || null, donor || null, buyers).subscribe((data) => {
                this.Gifts = data;
                this.cd.markForCheck();
            });
        } else {
            this.loadDemoData();
        }
    }

    convertToNumber(value: any): number | null {
        return value ? parseInt(value, 10) : null;
    }

    openNew(): void {
        this.isEditMode = false;
        this.giftForm.reset();
        this.giftForm.patchValue({
          price: 10,
          image: 'logo.png'
        });
        this.donorSrv.getAll().subscribe(d => this.donors = d);
        this.loadCategories();
        this.GiftDialog = true;
    }



    editGift(gift: Gift): void {
        this.isEditMode = true;
        this.editingGiftId = gift.id || null;
        this.giftForm.patchValue({
          name: gift.name,
          description: gift.description,
          price: gift.price,
          image: gift.image,
          donor: gift.donor,
          category: gift.category
        });
        this.donorSrv.getAll().subscribe(d => this.donors = d);
        this.loadCategories();
        this.GiftDialog = true;
    }

    // deleteSelectedGifts() {
    //     this.confirmationService.confirm({
    //         message: 'Are you sure you want to delete the selected Gifts?',
    //         header: 'Confirm',
    //         icon: 'pi pi-exclamation-triangle',
    //         rejectButtonProps: {
    //             label: 'No',
    //             severity: 'secondary',
    //             variant: 'text'
    //         },
    //         acceptButtonProps: {
    //             severity: 'danger',
    //             label: 'Yes'
    //         },
    //         accept: () => {

    //             // this.GiftService.deleteMultiple(this.selectedGifts!).subscribe(() => {
    //             //     this.loadDemoData();
    //             // });
    //             this.selectedGifts = null;
    //             this.messageService.add({
    //                 severity: 'success',
    //                 summary: 'Successful',
    //                 detail: 'Gifts Deleted',
    //                 life: 3000
    //             });
    //         }
    //     });
    // }

    hideDialog(): void {
        this.GiftDialog = false;
        this.giftForm.reset();
        this.isEditMode = false;
        this.editingGiftId = null;
    }

    deleteGift(Gift: Gift): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + Gift.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                variant: 'text'
            },
            acceptButtonProps: {
                severity: 'danger',
                label: 'Yes'
            },
            accept: () => {
                this.GiftService.delete(Gift.id!).subscribe({
                    next: (res: any) => {
                        this.loadDemoData();
                        const detail = res?.message ?? 'Gift Deleted';
                        this.systemMessageService.success('Successful', detail);
                    },
                    error: (err: any) => {
                        const detail = err?.error?.message ?? 'Could not delete gift';
                        this.systemMessageService.error('Error', detail);
                    }
                });
            }
        });
    }

    deleteAllGifts(): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete all Gifts?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                variant: 'text'
            },
            acceptButtonProps: {
                severity: 'danger',
                label: 'Yes'
            },
            accept: () => {
                this.GiftService.deleteAll().subscribe({
                    next: (res: any) => {
                        this.loadDemoData();
                        const detail = res?.message ?? 'All Gifts Deleted';
                        this.systemMessageService.success('Successful', detail);
                    },
                    error: (err: any) => {
                        const detail = err?.error?.message ?? 'Could not delete all gifts';
                        this.systemMessageService.error('Error', detail);
                    }
                });
            }
        });
    }

    // getSeverity(status: string) {
    //     switch (status) {
    //         case 'INSTOCK':
    //             return 'success';
    //         case 'LOWSTOCK':
    //             return 'warn';
    //         case 'OUTOFSTOCK':
    //             return 'danger';
    //     }
    // }

    saveGift(): void {
        if (!this.giftForm.valid) {
            this.systemMessageService.warning('Validation Error', 'Please fill in all required fields correctly');
            return;
        }

        const formValue = this.giftForm.getRawValue();
        const donor = formValue.donor as Donor;
        const category = formValue.category as Catergory;

        const giftData: Gift = {
            id: 0,
            name: formValue.name,
            description: formValue.description,
            price: formValue.price,
            image: formValue.image,
            donorId: donor.id,
            categoryId: category.id,
            donor: donor,
            category: category
        } as Gift;

        if (this.isEditMode) {
            if (this.editingGiftId) {
                giftData.id = this.editingGiftId;
                this.GiftService.update(giftData).subscribe({
                    next: (res: any) => {
                        this.hideDialog();
                        this.loadDemoData();
                        const detail = res?.message ?? 'Gift updated successfully';
                        this.systemMessageService.success('Success', detail);
                    },
                    error: (err: any) => {
                        const detail = err?.error?.message ?? 'Could not update gift';
                        this.systemMessageService.error('Error', detail);
                    }
                });
            }
        } else {
            this.GiftService.add(giftData).subscribe({
                next: (res: any) => {
                    this.hideDialog();
                    this.loadDemoData();
                    const detail = res?.message ?? 'Gift added successfully';
                    this.systemMessageService.success('Success', detail);
                },
                error: (err: any) => {
                    const detail = err?.error?.message ?? 'Could not add gift';
                    this.systemMessageService.error('Error', detail);
                }
            });
        }
    }

    loadCategories(): void {
        this.categorySrv.get().subscribe(d => this.categories = d);
    }

    showCategoryDialog(): void {
        this.categoryDialog = true;
        this.loadCategories();
    }

    addCategory(): void {
        this.categorySrv.add(this.categoryName).subscribe({
            next: (res: any) => {
                this.categoryName = '';
                this.loadCategories();
                const detail = res?.message ?? 'Category added';
                this.systemMessageService.success('Successful', detail);
            },
            error: (err: any) => {
                const detail = err?.error?.message ?? 'Could not add category';
                this.systemMessageService.error('Error', detail);
            }
        });
    }

    deleteCategory(event: Event, categoryId: number): void {
        this.confirmationService.confirm({
            target: event.currentTarget as EventTarget,
            message: 'למחוק?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'כן',
            rejectLabel: 'לא',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-secondary',
            accept: () => {
                this.categorySrv.delete(categoryId).subscribe({
                    next: (res: any) => {
                        this.loadCategories();
                        const detail = res?.message ?? 'נמחק';
                        this.systemMessageService.success('Successful', detail);
                    },
                    error: (err: any) => {
                        const detail = err?.error?.message ?? 'Could not delete category';
                        this.systemMessageService.error('Error', detail);
                    }
                });
            }
        });
    }

}

