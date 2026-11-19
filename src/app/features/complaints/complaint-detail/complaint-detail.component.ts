import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComplaintsService } from '../../../core/services/complaints.service';
import { CommentsService } from '../../../core/services/comments.service';
import { AttachmentsService } from '../../../core/services/attachments.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { HistoryService } from '../../../core/services/history.service';
import { StatusesService } from '../../../core/services/statuses.service';
import { UsersService } from '../../../core/services/users.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';
import {
  ComplaintDto,
  CommentDto,
  FeedbackDto,
  ComplaintHistoryDto,
  StatusDto,
  UserDto
} from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

type ActiveTab = 'comments' | 'attachments' | 'feedback' | 'history';

@Component({
  selector: 'app-complaint-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    StatusBadgeComponent,
    LoadingSkeletonComponent,
    TranslatePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb & Top Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <a routerLink="/complaints" class="cms-btn-secondary p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <svg class="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {{ 'complaintNumberPrefix' | translate }}{{ complaintId }}
              </h1>
              <!-- Copy Reference Number Button -->
              <button
                type="button"
                (click)="copyReferenceNumber()"
                class="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-brand-primary)] hover:bg-[var(--bg-surface-secondary)] transition-colors cursor-pointer"
                [title]="'copyRefNumber' | translate"
                aria-label="Copy reference number"
              >
                @if (isCopiedRef()) {
                  <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
              </button>
              @if (complaint()) {
                <app-status-badge [statusId]="complaint()!.statusId" [label]="complaint()!.statusName"></app-status-badge>
              }
            </div>
            <p class="text-xs text-[var(--text-muted)] mt-0.5">
              {{ 'submittedAtPrefix' | translate }} {{ complaint()?.createdAt | date: 'yyyy/MM/dd HH:mm' }}
            </p>
          </div>
        </div>

        <!-- Management Actions (Change Status, Assign, Print, Delete) -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Print Report Action -->
          <button
            type="button"
            (click)="printComplaintReport()"
            class="cms-btn-secondary text-xs px-3 py-2 inline-flex items-center gap-1.5"
            [title]="'printReport' | translate"
          >
            <svg class="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>{{ 'printReport' | translate }}</span>
          </button>

          <!-- Change Status (Admin or SuperAdmin) -->
          @if (auth.isStaff() && complaint()) {
            <div class="flex flex-col items-start gap-1">
              <div class="flex items-center gap-1.5 bg-[var(--bg-surface)] p-1.5 rounded-xl border border-[var(--border-subtle)] shadow-xs">
                <select
                  [(ngModel)]="newStatusId"
                  class="cms-input py-1 text-xs w-40"
                  aria-label="Status selection"
                >
                  @for (st of statuses(); track st.id) {
                    <option [ngValue]="st.id">{{ st.id | translate:'status':st.name }}</option>
                  }
                </select>
                <button
                  type="button"
                  (click)="onStatusChange()"
                  [disabled]="isUpdatingStatus() || newStatusId === complaint()!.statusId"
                  class="cms-btn-primary py-1 px-3 text-xs"
                >
                  {{ 'updateStatus' | translate }}
                </button>
              </div>
              @if (getStatusDescription(newStatusId)) {
                <span class="text-[11px] text-[var(--text-muted)] ps-1 flex items-center gap-1">
                  <svg class="w-3 h-3 text-[var(--color-brand-primary)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ getStatusDescription(newStatusId) }}
                </span>
              }
            </div>
          }

          <!-- Assign Complaint (SuperAdmin only) -->
          @if (auth.isSuperAdmin() && complaint()) {
            <button
              type="button"
              (click)="openAssignModal()"
              class="cms-btn-secondary text-xs px-3 py-2"
            >
              <svg class="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{{ 'assignComplaint' | translate }}</span>
            </button>
          }

          <!-- Delete Complaint Action (Owner when New, or Admin/SuperAdmin) -->
          @if (canDeleteComplaint()) {
            <button
              type="button"
              (click)="onDeleteComplaint()"
              [disabled]="isDeletingComplaint()"
              class="cms-btn-danger text-xs px-3 py-2 inline-flex items-center gap-1.5"
              [title]="'deleteComplaint' | translate"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{{ 'deleteComplaint' | translate }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Main Overview & Content Grid -->
      @if (isLoading()) {
        <app-loading-skeleton [count]="4"></app-loading-skeleton>
      } @else if (complaint(); as c) {
        <!-- Complaint Lifecycle Progress Stepper (Timeline) -->
        <div class="cms-card p-4 sm:p-5 bg-[var(--bg-surface)]">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[var(--color-brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {{ 'complaintProgressTimeline' | translate }}
            </span>
          </div>

          <!-- Stepper Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <!-- Stage 1: Created -->
            <div
              class="p-3 rounded-xl border transition-all"
              [ngClass]="c.statusId >= 1 ? 'bg-[var(--color-brand-primary-subtle)] border-[var(--color-brand-primary)]/40 text-[var(--text-primary)]' : 'bg-[var(--bg-surface-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)]'"
            >
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" [ngClass]="c.statusId >= 1 ? 'bg-[var(--color-brand-primary)] text-white' : 'bg-[var(--border-strong)] text-[var(--text-muted)]'">✓</div>
                <span class="text-xs font-bold">{{ 'timelineNew' | translate }}</span>
              </div>
              <p class="text-[10px] text-[var(--text-muted)] mt-1 ps-7">{{ c.createdAt | date: 'MM/dd HH:mm' }}</p>
            </div>

            <!-- Stage 2: In Progress -->
            <div
              class="p-3 rounded-xl border transition-all"
              [ngClass]="c.statusId === 2 ? 'bg-amber-500/10 border-amber-500/40 text-[var(--text-primary)] ring-2 ring-amber-500/20' : (c.statusId > 2 && c.statusId !== 4 ? 'bg-[var(--color-brand-primary-subtle)] border-[var(--color-brand-primary)]/40 text-[var(--text-primary)]' : 'bg-[var(--bg-surface-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)]')"
            >
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" [ngClass]="c.statusId > 2 && c.statusId !== 4 ? 'bg-[var(--color-brand-primary)] text-white' : (c.statusId === 2 ? 'bg-amber-500 text-white animate-pulse' : 'bg-[var(--border-strong)] text-[var(--text-muted)]')">
                  {{ c.statusId > 2 && c.statusId !== 4 ? '✓' : '2' }}
                </div>
                <span class="text-xs font-bold">{{ 'timelineInProgress' | translate }}</span>
              </div>
              <p class="text-[10px] text-[var(--text-muted)] mt-1 ps-7">
                {{ c.statusId >= 2 && c.statusId !== 4 ? (c.updatedAt ? (c.updatedAt | date: 'MM/dd HH:mm') : ('active' | translate)) : '-' }}
              </p>
            </div>

            <!-- Stage 3: Resolved -->
            <div
              class="p-3 rounded-xl border transition-all"
              [ngClass]="c.statusId === 5 ? 'bg-emerald-500/10 border-emerald-500/40 text-[var(--text-primary)] ring-2 ring-emerald-500/20' : (c.statusId === 3 ? 'bg-[var(--color-brand-primary-subtle)] border-[var(--color-brand-primary)]/40 text-[var(--text-primary)]' : 'bg-[var(--bg-surface-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)]')"
            >
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" [ngClass]="c.statusId === 5 || c.statusId === 3 ? 'bg-emerald-600 text-white' : 'bg-[var(--border-strong)] text-[var(--text-muted)]'">
                  {{ c.statusId === 5 || c.statusId === 3 ? '✓' : '3' }}
                </div>
                <span class="text-xs font-bold">{{ 'timelineResolved' | translate }}</span>
              </div>
              <p class="text-[10px] text-[var(--text-muted)] mt-1 ps-7">{{ c.resolvedAt ? (c.resolvedAt | date: 'MM/dd HH:mm') : (c.statusId === 5 ? ('active' | translate) : '-') }}</p>
            </div>

            <!-- Stage 4: Closed / Final -->
            <div
              class="p-3 rounded-xl border transition-all"
              [ngClass]="c.statusId === 3 ? 'bg-zinc-500/10 border-zinc-500/40 text-[var(--text-primary)] ring-2 ring-zinc-500/20' : (c.statusId === 4 ? 'bg-rose-500/10 border-rose-500/40 text-[var(--text-primary)]' : 'bg-[var(--bg-surface-secondary)] border-[var(--border-subtle)] text-[var(--text-muted)]')"
            >
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" [ngClass]="c.statusId === 3 ? 'bg-zinc-600 text-white' : (c.statusId === 4 ? 'bg-rose-600 text-white' : 'bg-[var(--border-strong)] text-[var(--text-muted)]')">
                  {{ c.statusId === 3 ? '✓' : (c.statusId === 4 ? '✕' : '4') }}
                </div>
                <span class="text-xs font-bold">{{ c.statusId === 4 ? ('rejected' | translate) : ('timelineClosed' | translate) }}</span>
              </div>
              <p class="text-[10px] text-[var(--text-muted)] mt-1 ps-7">{{ c.closedAt ? (c.closedAt | date: 'MM/dd HH:mm') : '-' }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column (2 Cols): Details & Tabs -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Complaint Summary Card -->
            <div class="cms-card p-6 bg-[var(--bg-surface)] text-[var(--text-primary)] space-y-4">
              <div>
                <span class="text-xs font-semibold text-[var(--color-brand-primary)] block mb-1">
                  {{ c.categoryId | translate:'category':(c.categoryName || ('categoryGeneral' | translate)) }}
                </span>
                <h2 class="text-lg font-bold text-[var(--text-primary)] leading-snug">
                  {{ c.title }}
                </h2>
              </div>

              <div class="p-4 bg-[var(--bg-surface-secondary)] rounded-xl border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {{ c.description }}
              </div>
            </div>

            <!-- Tab Navigation Header -->
            <div class="cms-card p-1.5 flex overflow-x-auto whitespace-nowrap scrollbar-none gap-1 bg-[var(--bg-surface-secondary)] border-[var(--border-subtle)]">
              <button
                type="button"
                (click)="switchTab('comments')"
                class="flex-1 min-w-[90px] sm:min-w-0 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 sm:shrink text-center"
                [ngClass]="activeTab() === 'comments' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
              >
                {{ 'commentsTab' | translate }} ({{ comments().length }})
              </button>
              <button
                type="button"
                (click)="switchTab('attachments')"
                class="flex-1 min-w-[90px] sm:min-w-0 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 sm:shrink text-center"
                [ngClass]="activeTab() === 'attachments' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
              >
                {{ 'attachmentsTab' | translate }}
              </button>
              <button
                type="button"
                (click)="switchTab('feedback')"
                class="flex-1 min-w-[90px] sm:min-w-0 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 sm:shrink text-center"
                [ngClass]="activeTab() === 'feedback' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
              >
                {{ 'feedbackTab' | translate }}
              </button>
              <button
                type="button"
                (click)="switchTab('history')"
                class="flex-1 min-w-[90px] sm:min-w-0 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 sm:shrink text-center"
                [ngClass]="activeTab() === 'history' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'"
              >
                {{ 'historyTab' | translate }} ({{ historyRecords().length }})
              </button>
            </div>

            <!-- Tab Content 1: Comments -->
            @if (activeTab() === 'comments') {
              <div class="cms-card p-6 space-y-6">
                <!-- Add Comment Form -->
                <form [formGroup]="commentForm" (ngSubmit)="onAddComment()" class="space-y-3">
                  <label class="block text-xs font-bold text-[var(--text-primary)]">
                    {{ 'addComment' | translate }}
                  </label>
                  <textarea
                    formControlName="comment"
                    rows="3"
                    [placeholder]="'writeComment' | translate"
                    class="cms-input resize-y text-xs"
                  ></textarea>
                  <div class="flex justify-end">
                    <button
                      type="submit"
                      [disabled]="commentForm.invalid || isAddingComment()"
                      class="cms-btn-primary px-4 py-2 text-xs"
                    >
                      {{ 'sendComment' | translate }}
                    </button>
                  </div>
                </form>

                <!-- Comments List -->
                <div class="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                  @if (comments().length === 0) {
                    <p class="text-xs text-[var(--text-muted)] text-center py-6">
                      {{ 'noCommentsFound' | translate }}
                    </p>
                  } @else {
                    @for (item of comments(); track item.id) {
                      <div class="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-start justify-between gap-3">
                        <div class="space-y-1">
                          <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-[var(--text-primary)]">
                              {{ item.userName || (('user' | translate) + ' #' + item.userId) }}
                            </span>
                            <span class="text-[10px] text-[var(--text-muted)]">
                              {{ item.createdAt | date: 'yyyy/MM/dd HH:mm' }}
                            </span>
                          </div>
                          <p class="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {{ item.comment }}
                          </p>
                        </div>

                        <!-- Delete button (Author or SuperAdmin) -->
                        @if (auth.isSuperAdmin() || auth.currentUser()?.id === item.userId) {
                          <button
                            type="button"
                            (click)="onDeleteComment(item.id)"
                            class="text-[var(--text-muted)] hover:text-[var(--color-danger)] transition-colors p-1 cursor-pointer"
                            [title]="'deleteCommentTitle' | translate"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        }
                      </div>
                    }
                  }
                </div>
              </div>
            }

            <!-- Tab Content 2: Attachments -->
            @if (activeTab() === 'attachments') {
              <div class="cms-card p-6 space-y-6">
                <!-- Upload Form -->
                <div class="p-4 bg-[var(--bg-surface-secondary)] border border-dashed border-[var(--border-strong)] rounded-xl space-y-3">
                  <h3 class="text-xs font-bold text-[var(--text-primary)]">
                    {{ 'uploadAttachment' | translate }}
                  </h3>
                  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      (change)="onAttachmentSelect($event)"
                      class="text-xs text-[var(--text-secondary)] file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-brand-primary-subtle)] file:text-[var(--color-brand-primary)] hover:file:bg-[var(--color-brand-primary)] hover:file:text-white cursor-pointer transition-colors"
                    />
                    <button
                      type="button"
                      [disabled]="!selectedAttachmentFile() || isUploadingAttachment()"
                      (click)="onUploadAttachment()"
                      class="cms-btn-accent px-4 py-2 text-xs"
                    >
                      {{ 'uploadAttachmentBtn' | translate }}
                    </button>
                  </div>
                </div>

                <!-- Attached Image Preview (Card 9 Preview Modal Link) -->
                @if (imageUrl()) {
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h4 class="text-xs font-bold text-[var(--text-primary)]">{{ 'attachedPhotoHeader' | translate }}</h4>
                      <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#C99745]/15 text-[#C99745] border border-[#C99745]/30">
                        {{ 'badgeAttachment' | translate }}
                      </span>
                    </div>

                    <div
                      (click)="previewAttachment()"
                      class="group relative max-w-md rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-[#C99745]/50"
                    >
                      <img
                        [src]="imageUrl()"
                        alt="Complaint Attachment"
                        class="w-full h-auto object-cover max-h-96 transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <!-- Hover Overlay -->
                      <div class="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 text-white">
                        <div class="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <span class="text-xs font-bold">{{ 'badgeAttachment' | translate }}</span>
                      </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="previewAttachment()"
                        class="cms-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{{ 'badgeAttachment' | translate }}</span>
                      </button>
                      <button
                        type="button"
                        (click)="downloadAttachment()"
                        class="cms-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{{ 'downloadAttachmentBtn' | translate }}</span>
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-8 text-xs text-[var(--text-muted)]">
                    {{ 'noAttachments' | translate }}
                  </div>
                }
              </div>
            }

            <!-- Tab Content 3: Feedback (Collection & Accessible 5-Star Rating) -->
            @if (activeTab() === 'feedback') {
              <div class="cms-card p-6 md:p-8 space-y-6">
                <!-- Loading State -->
                @if (isLoadingFeedback()) {
                  <div class="py-10 text-center space-y-3">
                    <div class="w-8 h-8 mx-auto border-2 border-[var(--color-brand-primary-subtle)] border-t-[var(--color-brand-primary)] rounded-full animate-spin"></div>
                    <p class="text-xs text-[var(--text-secondary)]">{{ 'loading' | translate }}</p>
                  </div>
                } @else if (feedbackLoadError()) {
                  <!-- Error State with Retry -->
                  <div class="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3 max-w-md mx-auto">
                    <div class="w-10 h-10 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p class="text-xs font-bold text-rose-600 dark:text-rose-400">{{ feedbackLoadError() }}</p>
                    <button
                      type="button"
                      (click)="loadFeedback(true)"
                      class="cms-btn-secondary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5 mx-auto"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>{{ 'retry' | translate }}</span>
                    </button>
                  </div>
                } @else {
                  <!-- Feedback Records List -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C99745]/15 text-[#C99745] border border-[#C99745]/30">
                          {{ 'badgeFeedback' | translate }}
                        </span>
                        <h3 class="text-sm font-bold text-[var(--text-primary)]">
                          {{ 'feedbackListTitle' | translate }} ({{ feedback().length }})
                        </h3>
                      </div>
                    </div>

                    @if (feedback().length === 0) {
                      <div class="py-8 text-center space-y-2 bg-[var(--bg-surface-secondary)] rounded-2xl border border-[var(--border-subtle)] p-6">
                        <div class="w-12 h-12 rounded-full bg-[#C99745]/10 text-[#C99745] flex items-center justify-center mx-auto">
                          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <h4 class="text-xs font-bold text-[var(--text-primary)]">{{ 'feedbackEmptyTitle' | translate }}</h4>
                        <p class="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">{{ 'feedbackEmptyDesc' | translate }}</p>
                      </div>
                    } @else {
                      <div class="space-y-3">
                        @for (item of feedback(); track item.id) {
                          <div class="p-5 rounded-2xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-3">
                            <!-- Header of feedback card -->
                            <div class="flex flex-wrap items-center justify-between gap-2">
                              <div class="flex items-center gap-2">
                                <span class="w-7 h-7 rounded-full bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)] font-bold text-xs flex items-center justify-center">
                                  {{ item.userName ? item.userName.charAt(0) : 'U' }}
                                </span>
                                <div>
                                  <p class="text-xs font-bold text-[var(--text-primary)]">
                                    {{ item.userName || ('user' | translate) }}
                                  </p>
                                  <p class="text-[10px] text-[var(--text-muted)]">
                                    {{ item.createdAt | date: 'yyyy/MM/dd HH:mm' }}
                                  </p>
                                </div>
                              </div>

                              <div class="flex items-center gap-2">
                                <!-- Star Display -->
                                <div class="flex items-center gap-1" [attr.aria-label]="getStarRatingAria(item.rating)">
                                  @for (star of [1, 2, 3, 4, 5]; track star) {
                                    <svg
                                      class="w-4 h-4"
                                      [ngClass]="star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-[var(--border-strong)]'"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  }
                                  <span class="text-xs font-bold text-amber-500 ms-1">{{ item.rating }}/5</span>
                                </div>

                                <!-- Edit action button if permitted -->
                                @if (canEditFeedback(item) && editingFeedbackId() !== item.id) {
                                  <button
                                    type="button"
                                    (click)="startEditFeedback(item)"
                                    class="cms-btn-secondary text-[11px] px-2.5 py-1 inline-flex items-center gap-1 cursor-pointer"
                                    [title]="'feedbackEditBtn' | translate"
                                  >
                                    <svg class="w-3 h-3 text-[var(--color-brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>{{ 'edit' | translate }}</span>
                                  </button>
                                }
                              </div>
                            </div>

                            <!-- If in Edit Mode for this item -->
                            @if (editingFeedbackId() === item.id) {
                              <form [formGroup]="editFeedbackForm" (ngSubmit)="onUpdateFeedback(item.id)" class="pt-3 border-t border-[var(--border-subtle)] space-y-3">
                                <div>
                                  <label class="block text-xs font-bold text-[var(--text-primary)] mb-1">
                                    {{ 'starsSelectLabel' | translate }}
                                  </label>
                                  <!-- Edit Radio Group for Stars -->
                                  <div
                                    class="flex items-center gap-2 py-1"
                                    role="radiogroup"
                                    [attr.aria-label]="'starsSelectLabel' | translate"
                                  >
                                    @for (star of [1, 2, 3, 4, 5]; track star) {
                                      <button
                                        type="button"
                                        role="radio"
                                        [attr.aria-checked]="editFeedbackForm.value.rating === star"
                                        [attr.aria-label]="getStarAriaLabel(star)"
                                        (click)="editFeedbackForm.patchValue({ rating: star })"
                                        class="p-1 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#C99745] cursor-pointer"
                                        [ngClass]="star <= (editFeedbackForm.value.rating || 0) ? 'text-amber-400' : 'text-[var(--border-strong)]'"
                                      >
                                        <svg class="w-6 h-6 fill-current" viewBox="0 0 20 20">
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      </button>
                                    }
                                  </div>
                                </div>

                                <div>
                                  <div class="flex items-center justify-between mb-1">
                                    <label class="text-xs font-bold text-[var(--text-primary)]">
                                      {{ 'feedbackComment' | translate }}
                                    </label>
                                    <span class="text-[10px] text-[var(--text-muted)] font-mono">
                                      {{ editFeedbackForm.value.comment?.length || 0 }} / 1000
                                    </span>
                                  </div>
                                  <textarea
                                    formControlName="comment"
                                    rows="3"
                                    maxlength="1000"
                                    class="cms-input resize-y text-xs"
                                  ></textarea>
                                </div>

                                <div class="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    (click)="cancelEditFeedback()"
                                    class="cms-btn-secondary text-xs px-3 py-1.5 cursor-pointer"
                                  >
                                    {{ 'cancel' | translate }}
                                  </button>
                                  <button
                                    type="submit"
                                    [disabled]="editFeedbackForm.invalid || isSubmittingFeedback()"
                                    class="cms-btn-primary text-xs px-4 py-1.5 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  >
                                    @if (isSubmittingFeedback()) {
                                      <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                      </svg>
                                    }
                                    <span>{{ 'feedbackSaveBtn' | translate }}</span>
                                  </button>
                                </div>
                              </form>
                            } @else {
                              <!-- Normal Comment Display -->
                              <p class="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-subtle)] whitespace-pre-wrap">
                                {{ item.comment || ('noAdditionalFeedbackNotes' | translate) }}
                              </p>
                            }
                          </div>
                        }
                      </div>
                    }

                    <!-- New Feedback Submission Section (Card 6 Design) -->
                    <div class="pt-6 border-t border-[var(--border-subtle)]">
                      <form [formGroup]="feedbackForm" (ngSubmit)="onSubmitFeedback()" class="max-w-md mx-auto space-y-4 text-center">
                        <div class="flex items-center justify-center">
                          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C99745]/15 text-[#C99745] border border-[#C99745]/30">
                            {{ 'addFeedbackPrompt' | translate }}
                          </span>
                        </div>

                        <div>
                          <h4 class="text-sm font-bold text-[var(--text-primary)]">
                            {{ 'feedbackDialogTitle' | translate }}
                          </h4>
                          <p class="text-xs text-[var(--text-secondary)] mt-1">
                            {{ 'feedbackDialogDesc' | translate }}
                          </p>
                        </div>

                        <!-- 5 Golden Interactive Stars with Accessible RadioGroup -->
                        <div class="space-y-1">
                          <div
                            class="flex items-center justify-center gap-2 py-1"
                            role="radiogroup"
                            [attr.aria-label]="'starsSelectLabel' | translate"
                            tabindex="0"
                            (keydown.arrowright)="onStarKeyNavigate('right')"
                            (keydown.arrowleft)="onStarKeyNavigate('left')"
                            (keydown.arrowup)="onStarKeyNavigate('up')"
                            (keydown.arrowdown)="onStarKeyNavigate('down')"
                          >
                            @for (star of [1, 2, 3, 4, 5]; track star) {
                              <button
                                type="button"
                                role="radio"
                                [attr.aria-checked]="feedbackForm.value.rating === star"
                                [attr.aria-label]="getStarAriaLabel(star)"
                                (click)="feedbackForm.patchValue({ rating: star })"
                                (mouseenter)="hoverRating.set(star)"
                                (mouseleave)="hoverRating.set(0)"
                                class="p-1.5 rounded-xl transition-all duration-150 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#C99745] cursor-pointer"
                                [ngClass]="star <= (hoverRating() || feedbackForm.value.rating || 0) ? 'text-amber-400' : 'text-[var(--border-strong)]'"
                              >
                                <svg class="w-7 h-7 fill-current drop-shadow-xs" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            }
                          </div>
                          @if (feedbackForm.get('rating')?.touched && !feedbackForm.get('rating')?.value) {
                            <p class="text-[11px] text-rose-500 font-semibold">{{ 'feedbackRatingRequired' | translate }}</p>
                          }
                        </div>

                        <!-- Comment Textarea with Character Counter -->
                        <div class="text-start">
                          <div class="flex items-center justify-between mb-1">
                            <label class="block text-xs font-bold text-[var(--text-primary)]">
                              {{ 'feedbackComment' | translate }}
                            </label>
                            <span class="text-[10px] text-[var(--text-muted)] font-mono">
                              {{ feedbackForm.get('comment')?.value?.length || 0 }} / 1000
                            </span>
                          </div>
                          <textarea
                            formControlName="comment"
                            rows="3"
                            maxlength="1000"
                            [placeholder]="'feedbackPlaceholderText' | translate"
                            class="cms-input resize-y text-xs"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          [disabled]="feedbackForm.invalid || isSubmittingFeedback()"
                          class="cms-btn-primary w-full py-2.5 text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          @if (isSubmittingFeedback()) {
                            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                          } @else {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          }
                          <span>{{ 'sendFeedbackBtn' | translate }}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Tab Content 4: Activity History Timeline -->
            @if (activeTab() === 'history') {
              <div class="cms-card p-6 space-y-6">
                @if (auth.isSuperAdmin() && historyRecords().length > 0) {
                  <!-- Detailed SuperAdmin Timeline -->
                  <div class="relative ps-6 space-y-6 before:absolute before:inset-y-0 before:start-2.5 before:w-0.5 before:bg-[var(--border-subtle)]">
                    @for (h of historyRecords(); track h.id) {
                      <div class="relative">
                        <span class="absolute -start-6 top-1 w-3 h-3 rounded-full bg-[var(--color-brand-primary)] ring-4 ring-[var(--bg-surface)]"></span>
                        <div class="text-xs font-bold text-[var(--text-primary)]">{{ h.action }}</div>
                        <div class="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {{ h.description || (h.oldValue ? ((translation.currentLang() === 'ar' ? 'من ' : 'From ') + h.oldValue + (translation.currentLang() === 'ar' ? ' إلى ' : ' to ') + h.newValue) : '') }}
                        </div>
                        <div class="text-[10px] text-[var(--text-muted)] mt-1 font-mono">{{ h.createdAt | date: 'yyyy/MM/dd HH:mm:ss' }}</div>
                      </div>
                    }
                  </div>
                } @else {
                  <!-- Standard Lifecycle Progression for User & Admin -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-bold text-[var(--text-primary)]">{{ 'complaintStagesHeader' | translate }}</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div class="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]" [ngClass]="c.createdAt ? 'border-teal-500/40 text-teal-400' : 'opacity-40'">
                        <span class="text-[10px] font-bold text-teal-600 dark:text-teal-400 block">{{ 'stage1Created' | translate }}</span>
                        <span class="text-[11px] text-[var(--text-secondary)] block mt-1">{{ c.createdAt | date: 'yyyy/MM/dd' }}</span>
                      </div>
                      <div class="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]" [ngClass]="c.updatedAt ? 'border-sky-500/40 text-sky-400' : 'opacity-40'">
                        <span class="text-[10px] font-bold text-sky-600 dark:text-sky-400 block">{{ 'stage2Processing' | translate }}</span>
                        <span class="text-[11px] text-[var(--text-secondary)] block mt-1">{{ c.updatedAt ? (c.updatedAt | date: 'yyyy/MM/dd') : ('inFollowUpState' | translate) }}</span>
                      </div>
                      <div class="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]" [ngClass]="c.resolvedAt ? 'border-emerald-500/40 text-emerald-400' : 'opacity-40'">
                        <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">{{ 'stage3Resolved' | translate }}</span>
                        <span class="text-[11px] text-[var(--text-secondary)] block mt-1">{{ c.resolvedAt ? (c.resolvedAt | date: 'yyyy/MM/dd') : ('notResolvedYetState' | translate) }}</span>
                      </div>
                      <div class="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]" [ngClass]="c.closedAt ? 'border-[var(--border-strong)]' : 'opacity-40'">
                        <span class="text-[10px] font-bold text-[var(--text-primary)] block">{{ 'stage4Closed' | translate }}</span>
                        <span class="text-[11px] text-[var(--text-secondary)] block mt-1">{{ c.closedAt ? (c.closedAt | date: 'yyyy/MM/dd') : ('openState' | translate) }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Right Column (1 Col): Sidebar Info Card -->
          <div class="space-y-6">
            <div class="cms-card p-6 bg-[var(--bg-surface)] space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {{ 'adminDataSidebarHeader' | translate }}
              </h3>

              <div class="divide-y divide-[var(--border-subtle)] text-xs">
                <!-- Status -->
                <div class="py-2.5 flex items-center justify-between">
                  <span class="text-[var(--text-secondary)]">{{ 'status' | translate }}</span>
                  <app-status-badge [statusId]="c.statusId" [label]="c.statusName"></app-status-badge>
                </div>

                <!-- Priority -->
                <div class="py-2.5 flex items-center justify-between">
                  <span class="text-[var(--text-secondary)]">{{ 'priority' | translate }}</span>
                  <span class="font-bold text-[var(--text-primary)]">{{ c.priorityId | translate:'priority':(c.priorityName || ('priorityNormal' | translate)) }}</span>
                </div>

                <!-- Category -->
                <div class="py-2.5 flex items-center justify-between">
                  <span class="text-[var(--text-secondary)]">{{ 'category' | translate }}</span>
                  <span class="font-bold text-[var(--text-primary)]">{{ c.categoryId | translate:'category':(c.categoryName || ('categoryGeneral' | translate)) }}</span>
                </div>

                <!-- Submitter -->
                <div class="py-2.5 flex items-center justify-between">
                  <span class="text-[var(--text-secondary)]">{{ 'complaintOwner' | translate }}</span>
                  <span class="font-bold text-[var(--text-primary)]">{{ c.userName || (('user' | translate) + ' #' + c.userId) }}</span>
                </div>

                <!-- Department -->
                <div class="py-2.5 flex items-center justify-between">
                  <span class="text-[var(--text-secondary)]">{{ 'department' | translate }}</span>
                  <span class="font-bold text-[var(--text-primary)]">{{ c.departmentName || ('departmentGeneral' | translate) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Assignment Modal (SuperAdmin only) -->
      @if (showAssignModal()) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div class="fixed inset-0 bg-[#211F1B]/60 backdrop-blur-sm" (click)="showAssignModal.set(false)"></div>
          <div class="relative bg-[var(--bg-surface-elevated)] backdrop-blur-xl text-[var(--text-primary)] border border-[var(--border-strong)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl z-10 space-y-4">
            <h3 class="text-base font-bold text-[var(--text-primary)]">
              {{ 'assignComplaint' | translate }}
            </h3>

            <div>
              <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {{ 'selectUser' | translate }} *
              </label>
              <select [(ngModel)]="assignedUserId" class="cms-input text-xs">
                <option [ngValue]="null" disabled>{{ 'selectEmployeePrompt' | translate }}</option>
                @for (u of users(); track u.id) {
                  <option [ngValue]="u.id">{{ u.name }} ({{ u.roleName | translate:'role' }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                {{ 'assignmentNotes' | translate }}
              </label>
              <textarea [(ngModel)]="assignNotes" rows="3" class="cms-input text-xs resize-y" [placeholder]="'assignDirectivesPlaceholder' | translate"></textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" (click)="showAssignModal.set(false)" class="cms-btn-secondary text-xs px-4 py-2">
                {{ 'cancel' | translate }}
              </button>
              <button
                type="button"
                (click)="onAssign()"
                [disabled]="!assignedUserId"
                class="cms-btn-primary text-xs px-5 py-2"
              >
                {{ 'confirm' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ComplaintDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private complaintsService = inject(ComplaintsService);
  private commentsService = inject(CommentsService);
  private attachmentsService = inject(AttachmentsService);
  private feedbackService = inject(FeedbackService);
  private historyService = inject(HistoryService);
  private statusesService = inject(StatusesService);
  private usersService = inject(UsersService);
  private toast = inject(ToastService);
  private modal = inject(ModalService);
  auth = inject(AuthService);
  translation = inject(TranslationService);

  complaintId!: number;
  complaint = signal<ComplaintDto | null>(null);
  isLoading = signal(true);
  activeTab = signal<ActiveTab>('comments');

  // Comments
  comments = signal<CommentDto[]>([]);
  isAddingComment = signal(false);
  commentForm: FormGroup = this.fb.group({
    comment: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  // Attachments
  imageUrl = signal<string | null>(null);
  selectedAttachmentFile = signal<File | null>(null);
  isUploadingAttachment = signal(false);

  // Copy ref & print
  isCopiedRef = signal(false);

  // Feedback State
  feedback = signal<FeedbackDto[]>([]);
  isLoadingFeedback = signal(false);
  feedbackLoadError = signal<string | null>(null);
  isSubmittingFeedback = signal(false);
  editingFeedbackId = signal<number | null>(null);
  hoverRating = signal<number>(0);

  feedbackForm: FormGroup = this.fb.group({
    rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.maxLength(1000)]]
  });

  editFeedbackForm: FormGroup = this.fb.group({
    rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.maxLength(1000)]]
  });

  // History
  historyRecords = signal<ComplaintHistoryDto[]>([]);

  // Status & Assignment
  statuses = signal<StatusDto[]>([]);
  newStatusId: number = 1;
  isUpdatingStatus = signal(false);

  showAssignModal = signal(false);
  users = signal<UserDto[]>([]);
  assignedUserId: number | null = null;
  assignNotes = '';

  attachmentsLoaded = false;
  feedbackLoaded = false;
  historyLoaded = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.complaintId = parseInt(idParam, 10);
      this.loadComplaintData();
    }
  }

  loadComplaintData(): void {
    this.isLoading.set(true);

    this.complaintsService.getById(this.complaintId).subscribe({
      next: (res) => {
        this.complaint.set(res);
        this.newStatusId = res.statusId;
        this.isLoading.set(false);
        this.loadComments();
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error(this.translation.translate('loadComplaintError'));
      }
    });

    // Load statuses for status change (cached)
    this.statusesService.getAll().subscribe({
      next: (res) => {
        // Sort according to recommended complaint lifecycle:
        // 1 (New) -> 2 (In Progress) -> 5 (Resolved) -> 3 (Closed) -> 4 (Rejected)
        const orderMap: Record<number, number> = { 1: 1, 2: 2, 5: 3, 3: 4, 4: 5 };
        const sorted = [...res].sort((a, b) => (orderMap[a.id] || 99) - (orderMap[b.id] || 99));
        this.statuses.set(sorted);
      },
      error: () => { }
    });
  }

  getStatusDescription(statusId?: number): string {
    return this.translation.getStatusDescription(statusId);
  }

  switchTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'attachments' && !this.attachmentsLoaded) {
      this.loadAttachments();
    } else if (tab === 'feedback' && !this.feedbackLoaded) {
      this.loadFeedback();
    } else if (tab === 'history' && !this.historyLoaded) {
      this.loadHistory();
    }
  }

  openAssignModal(): void {
    this.showAssignModal.set(true);
    if (this.users().length === 0 && this.auth.isSuperAdmin()) {
      this.usersService.getAll().subscribe({
        next: (res) => this.users.set(res.filter((u) => u.isActive)),
        error: (err) => {
          if (err.status >= 500) {
            this.toast.error(this.translation.translate('loadUsersError'));
          }
        }
      });
    }
  }

  loadComments(): void {
    this.commentsService.getByComplaint(this.complaintId).subscribe({
      next: (res) => this.comments.set(res || []),
      error: () => { }
    });
  }

  onAddComment(): void {
    if (this.commentForm.invalid || this.isAddingComment()) return;

    this.isAddingComment.set(true);
    const dto = {
      complaintId: this.complaintId,
      comment: this.commentForm.value.comment
    };

    this.commentsService.create(dto).subscribe({
      next: (created) => {
        this.comments.update((list) => [...list, created]);
        this.commentForm.reset();
        this.isAddingComment.set(false);
        this.toast.success(this.translation.translate('commentAdded'));
      },
      error: () => {
        this.isAddingComment.set(false);
        this.toast.error(this.translation.translate('commentAddError'));
      }
    });
  }

  async onDeleteComment(commentId: number): Promise<void> {
    const confirmed = await this.modal.confirm({
      title: this.translation.translate('deleteCommentTitle'),
      message: this.translation.translate('deleteCommentConfirmMsg'),
      isDanger: true,
      confirmText: this.translation.translate('delete')
    });

    if (!confirmed) return;

    this.commentsService.delete(commentId, this.complaintId).subscribe({
      next: () => {
        this.comments.update((list) => list.filter((c) => c.id !== commentId));
        this.toast.success(this.translation.translate('commentDeleted'));
      },
      error: () => {
        this.toast.error(this.translation.translate('commentDeleteError'));
      }
    });
  }

  loadAttachments(): void {
    this.attachmentsLoaded = true;
    this.attachmentsService.getImagePath(this.complaintId).subscribe({
      next: (url) => {
        if (url && url.trim().length > 0) {
          this.imageUrl.set(url.replace(/"/g, ''));
        }
      },
      error: () => { }
    });
  }

  previewAttachment(): void {
    const url = this.imageUrl();
    if (!url) return;
    this.modal.openAttachmentPreview({
      imageUrl: url,
      fileName: `complaint-${this.complaintId}-attachment.jpg`,
      canDelete: false,
      onDownload: () => this.downloadAttachment()
    });
  }

  downloadAttachment(): void {
    const url = this.imageUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaint-${this.complaintId}-attachment.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  onAttachmentSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedAttachmentFile.set(input.files[0]);
    }
  }

  onUploadAttachment(): void {
    const file = this.selectedAttachmentFile();
    if (!file) return;

    this.isUploadingAttachment.set(true);
    this.attachmentsService.upload(this.complaintId, file).subscribe({
      next: () => {
        this.isUploadingAttachment.set(false);
        this.toast.success(this.translation.translate('photoUploaded'));
        this.loadAttachments();
      },
      error: () => {
        this.isUploadingAttachment.set(false);
        // Note: As documented in integration issues, backend inverted check might return 400
        this.loadAttachments();
      }
    });
  }

  copyReferenceNumber(): void {
    const text = `#${this.complaintId}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.isCopiedRef.set(true);
        this.toast.success(this.translation.translate('refNumberCopied'));
        setTimeout(() => this.isCopiedRef.set(false), 2000);
      }).catch(() => {
        this.toast.info(text);
      });
    } else {
      this.toast.info(text);
    }
  }

  printComplaintReport(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  getStarAriaLabel(star: number): string {
    switch (star) {
      case 1: return this.translation.translate('star1Label');
      case 2: return this.translation.translate('star2Label');
      case 3: return this.translation.translate('star3Label');
      case 4: return this.translation.translate('star4Label');
      case 5: return this.translation.translate('star5Label');
      default: return `${star} / 5`;
    }
  }

  getStarRatingAria(rating: number): string {
    const template = this.translation.translate('starRatingAria');
    return template ? template.replace('{0}', String(rating)) : `${rating} / 5`;
  }

  onStarKeyNavigate(dir: 'left' | 'right' | 'up' | 'down'): void {
    const current = this.feedbackForm.value.rating || 0;
    const isRtl = this.translation.direction() === 'rtl';
    let next = current;

    if (dir === 'up' || (isRtl ? dir === 'left' : dir === 'right')) {
      next = Math.min(5, current + 1);
    } else if (dir === 'down' || (isRtl ? dir === 'right' : dir === 'left')) {
      next = Math.max(1, current - 1);
    }

    if (next !== current && next >= 1 && next <= 5) {
      this.feedbackForm.patchValue({ rating: next });
      this.feedbackForm.get('rating')?.markAsTouched();
    }
  }

  canEditFeedback(item: FeedbackDto): boolean {
    const currentUserId = this.auth.currentUser()?.id;
    if (!currentUserId || !this.complaint()) return false;
    const isAuthor = item.userId === currentUserId;
    const isOwnerOrSuper = this.complaint()!.userId === currentUserId || this.auth.isSuperAdmin();
    return isAuthor && isOwnerOrSuper;
  }

  startEditFeedback(item: FeedbackDto): void {
    this.editingFeedbackId.set(item.id);
    this.editFeedbackForm.patchValue({
      rating: item.rating,
      comment: item.comment || ''
    });
  }

  cancelEditFeedback(): void {
    this.editingFeedbackId.set(null);
    this.editFeedbackForm.reset({ rating: null, comment: '' });
  }

  loadFeedback(force = false): void {
    if (this.feedbackLoaded && !force) return;
    this.feedbackLoaded = true;
    this.isLoadingFeedback.set(true);
    this.feedbackLoadError.set(null);

    this.feedbackService.getByComplaint(this.complaintId).subscribe({
      next: (res) => {
        this.feedback.set(Array.isArray(res) ? res : (res ? [res] : []));
        this.isLoadingFeedback.set(false);
      },
      error: (err) => {
        this.isLoadingFeedback.set(false);
        if (err.status === 404) {
          this.feedback.set([]);
        } else {
          this.feedbackLoadError.set(err.error?.message || this.translation.translate('feedbackLoadError'));
        }
      }
    });
  }

  onSubmitFeedback(): void {
    this.feedbackForm.markAllAsTouched();
    if (this.feedbackForm.invalid || this.isSubmittingFeedback()) return;

    this.isSubmittingFeedback.set(true);
    const dto = {
      complaintId: this.complaintId,
      rating: Number(this.feedbackForm.value.rating),
      comment: this.feedbackForm.value.comment?.trim() || null
    };

    this.feedbackService.create(dto).subscribe({
      next: () => {
        this.isSubmittingFeedback.set(false);
        this.feedbackForm.reset({ rating: null, comment: '' });
        this.hoverRating.set(0);
        this.toast.success(this.translation.translate('feedbackSaved'));
        this.loadFeedback(true);
      },
      error: (err) => {
        this.isSubmittingFeedback.set(false);
        if (!(err as any)?.handledByInterceptor) {
          this.toast.error(err.error?.message || this.translation.translate('feedbackSubmitError'));
        }
      }
    });
  }

  onUpdateFeedback(feedbackId: number): void {
    this.editFeedbackForm.markAllAsTouched();
    if (this.editFeedbackForm.invalid || this.isSubmittingFeedback()) return;

    this.isSubmittingFeedback.set(true);
    const dto = {
      rating: Number(this.editFeedbackForm.value.rating),
      comment: this.editFeedbackForm.value.comment?.trim() || null
    };

    this.feedbackService.update(this.complaintId, feedbackId, dto).subscribe({
      next: () => {
        this.isSubmittingFeedback.set(false);
        this.editingFeedbackId.set(null);
        this.toast.success(this.translation.translate('feedbackUpdateSuccess'));
        this.loadFeedback(true);
      },
      error: (err) => {
        this.isSubmittingFeedback.set(false);
        if (!(err as any)?.handledByInterceptor) {
          this.toast.error(err.error?.message || this.translation.translate('feedbackSubmitError'));
        }
      }
    });
  }

  loadHistory(): void {
    this.historyLoaded = true;
    if (this.auth.isSuperAdmin()) {
      this.historyService.getByComplaint(this.complaintId).subscribe({
        next: (res) => this.historyRecords.set(res || []),
        error: () => { }
      });
    }
  }

  async onStatusChange(): Promise<void> {
    const statusIdNum = Number(this.newStatusId);
    if (!statusIdNum || statusIdNum === this.complaint()?.statusId) return;

    const currentStatusName = this.translation.translateStatus(this.complaint()?.statusId);
    const targetStatusName = this.translation.translateStatus(statusIdNum);

    const confirmed = await this.modal.confirm({
      title: this.translation.translate('confirmActionTitle'),
      message: this.translation.currentLang() === 'ar'
        ? `هل أنت متأكد من تغيير حالة الشكوى رقم #${this.complaintId}؟`
        : `Are you sure you want to change the status of complaint #${this.complaintId}?`,
      highlightText: `${currentStatusName} ➔ ${targetStatusName}`,
      confirmText: this.translation.translate('confirmAction'),
      badgeText: this.translation.translate('badgeConfirmAction'),
      type: 'action',
      isDanger: false
    });

    if (!confirmed) {
      this.newStatusId = this.complaint()?.statusId || 1;
      return;
    }

    this.isUpdatingStatus.set(true);
    this.complaintsService.changeStatus(this.complaintId, statusIdNum).subscribe({
      next: () => {
        this.isUpdatingStatus.set(false);
        this.toast.success(this.translation.translate('statusUpdateSuccess'));
        this.loadComplaintData();
      },
      error: (err) => {
        this.isUpdatingStatus.set(false);
        this.newStatusId = this.complaint()?.statusId || 1;
        this.toast.error(err.error?.message || this.translation.translate('statusUpdateFailed'));
      }
    });
  }

  onAssign(): void {
    if (!this.assignedUserId) return;

    this.complaintsService
      .assign({
        complaintId: this.complaintId,
        assignedToUserId: this.assignedUserId,
        notes: this.assignNotes
      })
      .subscribe({
        next: () => {
          this.showAssignModal.set(false);
          this.toast.success(this.translation.translate('complaintAssigned'));
          this.loadComplaintData();
        },
        error: (err) => {
          this.toast.error(err.error?.message || this.translation.translate('complaintAssignFailed'));
        }
      });
  }

  isDeletingComplaint = signal(false);

  canDeleteComplaint(): boolean {
    const c = this.complaint();
    if (!c) return false;
    if (this.auth.isStaff()) return true;
    const currentUserId = this.auth.currentUser()?.id;
    return !!currentUserId && c.userId === currentUserId && c.statusId === 1;
  }

  async onDeleteComplaint(): Promise<void> {
    const c = this.complaint();
    if (!c) return;

    const confirmed = await this.modal.confirm({
      title: this.translation.translate('deleteComplaintTitle'),
      message: this.translation.translate('deleteComplaintConfirmMsg'),
      highlightText: `#${c.id} - ${c.title}`,
      confirmText: this.translation.translate('confirmDeleteBtn'),
      cancelText: this.translation.translate('cancelActionBtn'),
      type: 'danger',
      isDanger: true
    });

    if (!confirmed) return;

    this.isDeletingComplaint.set(true);
    this.complaintsService.delete(this.complaintId).subscribe({
      next: () => {
        this.isDeletingComplaint.set(false);
        this.toast.success(this.translation.translate('deleteComplaintSuccess'));
        this.router.navigate(['/complaints'], { replaceUrl: true });
      },
      error: (err) => {
        this.isDeletingComplaint.set(false);
        this.toast.error(err.error?.message || this.translation.translate('deleteComplaintError'));
      }
    });
  }
}
