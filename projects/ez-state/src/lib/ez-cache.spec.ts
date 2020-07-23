import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { EzCache } from './ez-cache';

describe('EzCache', () => {
  it('value should be undefined', () => {
    const cache = new EzCache();
    expect(cache.value).toBeUndefined();
  });

  it('value should return constructed value', () => {
    const cache = new EzCache('value');
    expect(cache.value).toEqual('value');
  });

  it('value$ should return constructed value', () => {
    const cache = new EzCache('value');
    let value: string;
    const subscription = cache.value$.subscribe((v) => {
      value = v;
    });
    subscription.unsubscribe();
    expect(value).toEqual('value');
  });

  it('next should update value', () => {
    const cache = new EzCache('');
    cache.next('value');
    expect(cache.value).toEqual('value');
  });

  it('should run custom error handler as second constructor paramater', () => {
    const cache = new EzCache('', () => 'custom error');
    cache.load(throwError('custom error'));
    let error: string;
    const subscription = cache.loadError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('custom error');
  });

  it('should run custom error handler as first constructor paramater', () => {
    const cache = new EzCache(() => 'custom error');
    cache.load(throwError('custom error'));
    let error: string;
    const subscription = cache.loadError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('custom error');
  });

  it('reset should reset value', () => {
    const cache = new EzCache('value');
    cache.reset();
    expect(cache.value).toBeUndefined();
  });

  it('complete should finalise', () => {
    const cache = new EzCache('');
    cache.load(of(''));
    cache.complete();
    let called = false;
    const subscription = cache.value$.subscribe((_) => {
      called = true;
    });
    subscription.unsubscribe();
    expect(called).toBeFalsy();
  });
});

describe('EzCache load', () => {
  it('load should update value', () => {
    const cache = new EzCache('');
    cache.load(of('value'));
    expect(cache.value).toEqual('value');
  });

  it('load error should update loadError$', () => {
    const cache = new EzCache('');
    cache.load(throwError('load error'));
    let error: string;
    const subscription = cache.loadError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('load error');
  });

  it('resetState should reset loadError$', () => {
    const cache = new EzCache();
    cache.load(throwError('load error'));
    cache.resetState();
    let error: string;
    const subscription = cache.loadError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toBeUndefined();
  });

  it('load error should update error$', () => {
    const cache = new EzCache('');
    cache.load(throwError('load error'));
    let error: string;
    const subscription = cache.error$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('load error');
  });

  it('should be loading for 5ms', () => {
    const cache = new EzCache('');
    cache.load(of('value').pipe(delay(5)));
    let loading: boolean;
    const subscription = cache.loading$.subscribe((l) => {
      loading = l;
    });
    subscription.unsubscribe();
    expect(loading).toBeTruthy();
  });

  it('should not be loading after 5ms', fakeAsync(() => {
    const cache = new EzCache('');
    cache.load(of('value').pipe(delay(5)));
    let loading: boolean;
    const subscription = cache.loading$.subscribe((l) => {
      loading = l;
    });
    tick(6);
    subscription.unsubscribe();
    expect(loading).toBeFalsy();
  }));

  it('should not be loaded for 5ms', () => {
    const cache = new EzCache('');
    cache.load(of('value').pipe(delay(5)));
    let loaded: boolean;
    const subscription = cache.loaded$.subscribe((l) => {
      loaded = l;
    });
    subscription.unsubscribe();
    expect(loaded).toBeFalsy();
  });

  it('should be loaded after 5ms', fakeAsync(() => {
    const cache = new EzCache('');
    cache.load(of('value').pipe(delay(5)));
    let loaded: boolean;
    const subscription = cache.loaded$.subscribe((l) => {
      loaded = l;
    });
    tick(6);
    subscription.unsubscribe();
    expect(loaded).toBeTruthy();
  }));

  it('resetState should reset loaded', () => {
    const cache = new EzCache();
    cache.load(of('value'));
    cache.resetState();
    let loaded: boolean;
    const subscription = cache.loaded$.subscribe((l) => {
      loaded = l;
    });
    subscription.unsubscribe();
    expect(loaded).toBeFalsy();
  });
});

describe('EzCache save', () => {
  it('save should update value', () => {
    const cache = new EzCache('');
    cache.save(of('value'));
    expect(cache.value).toEqual('value');
  });

  it('save ignoreResponse should not update value', () => {
    const cache = new EzCache('value');
    cache.save(of('save response'), true);
    expect(cache.value).toEqual('value');
  });

  it('save error should update saveError$', () => {
    const cache = new EzCache('');
    cache.save(throwError('save error'));
    let error: string;
    const subscription = cache.saveError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('save error');
  });

  it('resetState should reset saveError$', () => {
    const cache = new EzCache();
    cache.save(throwError('save error'));
    cache.resetState();
    let error: string;
    const subscription = cache.saveError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toBeUndefined();
  });

  it('save error should update error$', () => {
    const cache = new EzCache('');
    cache.save(throwError('save error'));
    let error: string;
    const subscription = cache.error$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('save error');
  });

  it('should be saving for 5ms', () => {
    const cache = new EzCache('');
    cache.save(of('value').pipe(delay(5)));
    let saving: boolean;
    const subscription = cache.saving$.subscribe((s) => {
      saving = s;
    });
    subscription.unsubscribe();
    expect(saving).toBeTruthy();
  });

  it('should not be saving after 5ms', fakeAsync(() => {
    const cache = new EzCache('');
    cache.save(of('value').pipe(delay(5)));
    let saving: boolean;
    const subscription = cache.saving$.subscribe((s) => {
      saving = s;
    });
    tick(6);
    subscription.unsubscribe();
    expect(saving).toBeFalsy();
  }));

  it('should not be saved for 5ms', () => {
    const cache = new EzCache('');
    cache.save(of('value').pipe(delay(5)));
    let saved: boolean;
    const subscription = cache.saved$.subscribe((s) => {
      saved = s;
    });
    subscription.unsubscribe();
    expect(saved).toBeFalsy();
  });

  it('should be saved after 5ms', fakeAsync(() => {
    const cache = new EzCache('');
    cache.save(of('value').pipe(delay(5)));
    let saved: boolean;
    const subscription = cache.saved$.subscribe((s) => {
      saved = s;
    });
    tick(6);
    subscription.unsubscribe();
    expect(saved).toBeTruthy();
  }));

  it('resetState should reset saved', () => {
    const cache = new EzCache();
    cache.save(of('value'));
    cache.resetState();
    let saved: boolean;
    const subscription = cache.saved$.subscribe((s) => {
      saved = s;
    });
    subscription.unsubscribe();
    expect(saved).toBeFalsy();
  });
});

describe('EzCache update', () => {
  it('update should update value', () => {
    const cache = new EzCache('');
    cache.update(of('value'));
    expect(cache.value).toEqual('value');
  });

  it('update ignoreResponse should not update value', () => {
    const cache = new EzCache('value');
    cache.update(of('update response'), true);
    expect(cache.value).toEqual('value');
  });

  it('update error should update updateError$', () => {
    const cache = new EzCache('');
    cache.update(throwError('update error'));
    let error: string;
    const subscription = cache.updateError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('update error');
  });

  it('resetState should reset updateError$', () => {
    const cache = new EzCache();
    cache.update(throwError('update error'));
    cache.resetState();
    let error: string;
    const subscription = cache.updateError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toBeUndefined();
  });

  it('update error should update error$', () => {
    const cache = new EzCache('');
    cache.update(throwError('update error'));
    let error: string;
    const subscription = cache.error$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('update error');
  });

  it('should be updating for 5ms', () => {
    const cache = new EzCache('');
    cache.update(of('value').pipe(delay(5)));
    let updating: boolean;
    const subscription = cache.updating$.subscribe((u) => {
      updating = u;
    });
    subscription.unsubscribe();
    expect(updating).toBeTruthy();
  });

  it('should not be updating after 5ms', fakeAsync(() => {
    const cache = new EzCache('');
    cache.update(of('value').pipe(delay(5)));
    let updating: boolean;
    const subscription = cache.updating$.subscribe((u) => {
      updating = u;
    });
    tick(6);
    subscription.unsubscribe();
    expect(updating).toBeFalsy();
  }));

  it('should not be updated for 5ms', () => {
    const cache = new EzCache('');
    cache.update(of('value').pipe(delay(5)));
    let updated: boolean;
    const subscription = cache.updated$.subscribe((u) => {
      updated = u;
    });
    subscription.unsubscribe();
    expect(updated).toBeFalsy();
  });

  it('should be updated after 5ms', fakeAsync(() => {
    const cache = new EzCache('');
    cache.update(of('value').pipe(delay(5)));
    let updated: boolean;
    const subscription = cache.updated$.subscribe((u) => {
      updated = u;
    });
    tick(6);
    subscription.unsubscribe();
    expect(updated).toBeTruthy();
  }));

  it('resetState should reset updated', () => {
    const cache = new EzCache();
    cache.update(of('value'));
    cache.resetState();
    let updated: boolean;
    const subscription = cache.updated$.subscribe((s) => {
      updated = s;
    });
    subscription.unsubscribe();
    expect(updated).toBeFalsy();
  });
});

describe('EzCache delete', () => {
  it('delete should update value', () => {
    const cache = new EzCache('');
    cache.delete(of('value'));
    expect(cache.value).toEqual('value');
  });

  it('delete ignoreResponse should not update value', () => {
    const cache = new EzCache('value');
    cache.delete(of('delete response'), true);
    expect(cache.value).toEqual('value');
  });

  it('delete error should update deleteError$', () => {
    const cache = new EzCache('');
    cache.delete(throwError('delete error'));
    let error: string;
    const subscription = cache.deleteError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('delete error');
  });

  it('resetState should reset deleteError$', () => {
    const cache = new EzCache();
    cache.delete(throwError('delete error'));
    cache.resetState();
    let error: string;
    const subscription = cache.deleteError$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toBeUndefined();
  });

  it('delete error should update error$', () => {
    const cache = new EzCache('');
    cache.delete(throwError('delete error'));
    let error: string;
    const subscription = cache.error$.subscribe((e) => {
      error = e;
    });
    subscription.unsubscribe();
    expect(error).toEqual('delete error');
  });

  it('should be deleting for 5ms', () => {
    const cache = new EzCache('');
    cache.delete(of('value').pipe(delay(5)));
    let deleting: boolean;
    const subscription = cache.deleting$.subscribe((d) => {
      deleting = d;
    });
    subscription.unsubscribe();
    expect(deleting).toBeTruthy();
  });

  it('should not be deleting after 5ms', fakeAsync(() => {
    const cache = new EzCache('');
    cache.delete(of('value').pipe(delay(5)));
    let deleting: boolean;
    const subscription = cache.deleting$.subscribe((d) => {
      deleting = d;
    });
    tick(6);
    subscription.unsubscribe();
    expect(deleting).toBeFalsy();
  }));

  it('should not be deleted for 5ms', () => {
    const cache = new EzCache('');
    cache.delete(of('value').pipe(delay(5)));
    let deleted: boolean;
    const subscription = cache.deleted$.subscribe((d) => {
      deleted = d;
    });
    subscription.unsubscribe();
    expect(deleted).toBeFalsy();
  });

  it('should be deleted after 5ms', fakeAsync(() => {
    const cache = new EzCache('');
    cache.delete(of('value').pipe(delay(5)));
    let deleted: boolean;
    const subscription = cache.deleted$.subscribe((d) => {
      deleted = d;
    });
    tick(6);
    subscription.unsubscribe();
    expect(deleted).toBeTruthy();
  }));

  it('resetState should reset deleted', () => {
    const cache = new EzCache();
    cache.delete(of('value'));
    cache.resetState();
    let deleted: boolean;
    const subscription = cache.deleted$.subscribe((s) => {
      deleted = s;
    });
    subscription.unsubscribe();
    expect(deleted).toBeFalsy();
  });
});