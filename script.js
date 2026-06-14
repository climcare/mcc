console.log("🚀 Tentando conectar ao Supabase...");

const SUPABASE_URL = 'https://iaylyacrzurcjwvtecpu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pkzx4u5U9Xr407syiBE9yA_G7hUvGaw';

let supabaseClient = null;

window.onload = async () => {
    console.log("✅ Página carregada");

    // Inicializa Supabase
    if (typeof Supabase !== "undefined") {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase Client criado!");
        
        await lerUltimaLeitura();
        setInterval(lerUltimaLeitura, 15000); // atualiza a cada 15s
    } else {
        console.error("❌ Supabase JS não carregou. Verifique o <script> no HTML.");
    }
};

async function lerUltimaLeitura() {
    if (!supabaseClient) return;

    try {
        const { data, error } = await supabaseClient
            .from('sensor_readings')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error("Erro na consulta:", error);
            return;
        }

        if (data) {
            console.log("✅ Última leitura encontrada:", data);
            document.getElementById('scoreCard').innerHTML = `
                <h2 class="text-2xl font-bold mb-4">Última Leitura</h2>
                <pre class="bg-gray-900 p-4 rounded-xl text-xs overflow-auto">${JSON.stringify(data, null, 2)}</pre>
            `;
        } else {
            console.log("Nenhuma leitura encontrada ainda");
        }
    } catch (err) {
        console.error("Erro ao ler banco:", err);
    }
}
