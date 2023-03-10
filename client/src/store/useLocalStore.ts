import { reactive } from 'vue';

export default function <T extends Object>(key: string, defaultValue: T) {
  let temp: T;
  try {
    let store: string | null = localStorage.getItem(key);
    if (store) {
      temp = JSON.parse(store);
    } else {
      temp = defaultValue;
    }
  } catch (error) {
    temp = defaultValue;
  }

  let data = reactive<T>(temp);

  window.addEventListener('beforeunload', (event) => {
    localStorage.setItem(key, JSON.stringify(data));
  });

  window.addEventListener('storage', (event) => {
    if (event.key === key) {
      if (!event.newValue) {
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            delete data[key];
          }
        }
      }
    }
    console.log(event);
  });
  return data;
}
