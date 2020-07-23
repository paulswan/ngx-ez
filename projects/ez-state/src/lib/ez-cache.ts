import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { EzState } from './ez-state';
import { EzStateAction } from './ez-state-action';

export class EzCache<T> {
  private state$: BehaviorSubject<EzState<T>>;

  private subscriptions: {
    load?: Subscription;
    save?: Subscription;
    update?: Subscription;
    delete?: Subscription;
  } = {};

  private errorHandler: (error?: any, action?: EzStateAction) => any;

  static generalErrorHandler(error: any, action: EzStateAction): any {
    return error;
  }

  constructor(
    valueOrErrorHandler?: T | ((error?: any, action?: EzStateAction) => any),
    errorHandler?: (error?: any, action?: EzStateAction) => any
  ) {
    if (typeof valueOrErrorHandler === 'function') {
      this.errorHandler = valueOrErrorHandler as (error?: any, action?: EzStateAction) => any;
      this.state$ = new BehaviorSubject({ value: undefined });
    } else {
      this.state$ = new BehaviorSubject({ value: valueOrErrorHandler });
      this.errorHandler = errorHandler;
    }
  }

  get value(): T {
    return this.state$.value.value;
  }

  get value$(): Observable<T> {
    return this.state$.pipe(
      map((state) => state.value),
      distinctUntilChanged()
    );
  }

  get loading$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.loading || false),
      distinctUntilChanged()
    );
  }

  get loaded$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.loaded || false),
      distinctUntilChanged()
    );
  }

  get loadError$(): Observable<any> {
    return this.state$.pipe(
      map((state) => state.loadError),
      distinctUntilChanged()
    );
  }

  get saving$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.saving || false),
      distinctUntilChanged()
    );
  }

  get saved$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.saved || false),
      distinctUntilChanged()
    );
  }

  get saveError$(): Observable<any> {
    return this.state$.pipe(
      map((state) => state.saveError),
      distinctUntilChanged()
    );
  }

  get updating$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.updating || false),
      distinctUntilChanged()
    );
  }

  get updated$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.updated || false),
      distinctUntilChanged()
    );
  }

  get updateError$(): Observable<any> {
    return this.state$.pipe(
      map((state) => state.updateError),
      distinctUntilChanged()
    );
  }

  get deleting$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.deleting || false),
      distinctUntilChanged()
    );
  }

  get deleted$(): Observable<boolean> {
    return this.state$.pipe(
      map((state) => state.deleted || false),
      distinctUntilChanged()
    );
  }

  get deleteError$(): Observable<any> {
    return this.state$.pipe(
      map((state) => state.deleteError),
      distinctUntilChanged()
    );
  }

  get error$(): Observable<any> {
    return this.state$.pipe(
      map((state) => state.loadError || state.saveError || state.updateError || state.deleteError),
      distinctUntilChanged()
    );
  }

  next(value: T): void {
    this.unsubscribe();
    this.state$.next({ value });
  }

  reset(): void {
    this.unsubscribe();
    this.state$.next({ value: undefined });
  }

  resetState(): void {
    this.unsubscribe();
    this.state$.next({ value: this.value });
  }

  complete(): void {
    this.unsubscribe();
    this.state$.complete();
  }

  load(load$: Observable<T>): void {
    this.unsubscribe(EzStateAction.load);
    this.state$.next({ value: this.value, loading: true });
    this.subscriptions.load = load$.subscribe(
      (value) => {
        this.state$.next({ value, loaded: true });
      },
      (error) => {
        this.state$.next({ value: this.value, loadError: this.generateError(error, EzStateAction.load) });
      }
    );
  }

  save(save$: Observable<T>): void;
  save(save$: Observable<any>, ignoreResponse?: boolean): void;
  save(save$: Observable<any>, ignoreResponse?: boolean): void {
    this.unsubscribe(EzStateAction.save);
    this.state$.next({ value: this.value, saving: true });
    this.subscriptions.save = save$.subscribe(
      (value) => {
        this.state$.next({ value: ignoreResponse ? this.value : value, saved: true });
      },
      (error) => {
        this.state$.next({ value: this.value, saveError: this.generateError(error, EzStateAction.save) });
      }
    );
  }

  update(update$: Observable<T>): void;
  update(update$: Observable<any>, ignoreResponse?: boolean): void;
  update(update$: Observable<any>, ignoreResponse?: boolean): void {
    this.unsubscribe(EzStateAction.update);
    this.state$.next({ value: this.value, updating: true });
    this.subscriptions.save = update$.subscribe(
      (value) => {
        this.state$.next({ value: ignoreResponse ? this.value : value, updated: true });
      },
      (error) => {
        this.state$.next({ value: this.value, updateError: this.generateError(error, EzStateAction.update) });
      }
    );
  }

  delete(delete$: Observable<T>): void;
  delete(delete$: Observable<any>, ignoreResponse?: boolean): void;
  delete(delete$: Observable<any>, ignoreResponse?: boolean): void {
    this.unsubscribe(EzStateAction.delete);
    this.state$.next({ value: this.value, deleting: true });
    this.subscriptions.save = delete$.subscribe(
      (value) => {
        this.state$.next({ value: ignoreResponse ? this.value : value, deleted: true });
      },
      (error) => {
        this.state$.next({ value: this.value, deleteError: this.generateError(error, EzStateAction.delete) });
      }
    );
  }

  unsubscribe(action?: EzStateAction): void {
    if (action) {
      const subscription = this.subscriptions[action];
      if (subscription) {
        subscription.unsubscribe();
        delete this.subscriptions[action];
      }
    } else {
      this.unsubscribe(EzStateAction.load);
      this.unsubscribe(EzStateAction.save);
      this.unsubscribe(EzStateAction.update);
      this.unsubscribe(EzStateAction.delete);
    }
  }

  private generateError(error: any, action: EzStateAction): any {
    return (this.errorHandler && this.errorHandler(error, action)) || EzCache.generalErrorHandler(error, action);
  }
}