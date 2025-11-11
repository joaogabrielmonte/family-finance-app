export default function NotFound() {
  const storedUser = localStorage.getItem("user");
  const redirectTo = storedUser ? "/dashboard" : "/login";

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-gray-700">404</h1>
      <p className="text-gray-700 text-xl mt-2">
        Ops! A página que você procura não existe.
      </p>
      <a
        href={redirectTo}
        className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
      >
        {storedUser ? "Voltar ao Dashboard" : "Ir para Login"}
      </a>
    </div>
  );
}
