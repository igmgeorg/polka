const DATA_SOURCE = `${import.meta.env.BASE_URL}books.json`;

export async function loadLibrary() {
  const response = await fetch(DATA_SOURCE);
  if (!response.ok) throw new Error("Не удалось загрузить каталог книг");
  return response.json();
}
