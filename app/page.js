'use client';

import { useEffect, useState } from 'react';
import { browserDb } from '../lib/supabase/client';

export default function Home() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await browserDb().auth.getSession();

      if (!data.session) {
        location.href = '/login';
        return;
      }

      setToken(data.session.access_token);
    })();
  }, []);

  useEffect(() => {
    if (token) load();
  }, [token]);

  async function api(path, opt = {}) {
    const response = await fetch(path, {
      ...opt,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token,
        ...opt.headers,
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Erro na solicitação');
    }

    return response;
  }

  async function load() {
    try {
      setLoading(true);

      const response = await api('/api/qr');
      const data = await response.json();

      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function create(e) {
    e.preventDefault();

    try {
      await api('/api/qr', {
        method: 'POST',
        body: JSON.stringify({
          name,
          url,
        }),
      });

      setName('');
      setUrl('');
      await load();
    } catch (error) {
      alert('Não foi possível criar o QR Code.');
      console.error(error);
    }
  }

  async function edit(x) {
    const newUrl = prompt('Novo link de destino:', x.destination_url);

    if (!newUrl || newUrl === x.destination_url) return;

    try {
      await api('/api/qr/' + x.id, {
        method: 'PATCH',
        body: JSON.stringify({
          destination_url: newUrl,
        }),
      });

      await load();
    } catch (error) {
      alert('Não foi possível alterar o link.');
      console.error(error);
    }
  }

  async function toggle(x) {
    try {
      await api('/api/qr/' + x.id, {
        method: 'PATCH',
        body: JSON.stringify({
          active: !x.active,
        }),
      });

      await load();
    } catch (error) {
      alert('Não foi possível alterar o status.');
      console.error(error);
    }
  }

  async function qr(x) {
    try {
      const response = await api('/api/qr?slug=' + x.slug);
      const blob = await response.blob();

      const link = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = 'qr-' + x.slug + '.png';

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(link.href);
    } catch (error) {
      alert('Não foi possível baixar o QR Code.');
      console.error(error);
    }
  }

  async function logout() {
    await browserDb().auth.signOut();
    location.href = '/login';
  }

  const totalAccess = items.reduce(
    (total, item) => total + (item.scans?.[0]?.count || 0),
    0
  );

  const activeQr = items.filter((item) => item.active).length;

  const inactiveQr = items.length - activeQr;

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon">QR</div>

          <div>
            <strong>QR Manager</strong>
            <small>Dynamic Code</small>
          </div>
        </div>

        <nav>
          <button className="menuItem active">
            <span>⌂</span>
            Dashboard
          </button>

          <button className="menuItem">
            <span>▦</span>
            Meus QR Codes
          </button>

          <button className="menuItem">
            <span>◫</span>
            Analytics
          </button>

          <button className="menuItem">
            <span>↓</span>
            Downloads
          </button>

          <button className="menuItem">
            <span>⚙</span>
            Configurações
          </button>
        </nav>

        <button className="logout" onClick={logout}>
          Sair
        </button>
      </aside>

      <section className="dashboardContent">
        <header className="topbar">
          <div>
            <p className="eyebrow">PAINEL DE CONTROLE</p>
            <h1>Dashboard</h1>
            <p>Gerencie seus QR Codes dinâmicos em um só lugar.</p>
          </div>

          <button
            className="primaryButton"
            onClick={() =>
              document
                .getElementById('novo-qr')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            + Novo QR Code
          </button>
        </header>

        <section className="statsGrid">
          <article className="statCard">
            <div className="statIcon">▦</div>
            <div>
              <span>Total de QR Codes</span>
              <strong>{items.length}</strong>
            </div>
          </article>

          <article className="statCard">
            <div className="statIcon">✓</div>
            <div>
              <span>QR Codes ativos</span>
              <strong>{activeQr}</strong>
            </div>
          </article>

          <article className="statCard">
            <div className="statIcon">◉</div>
            <div>
              <span>Total de acessos</span>
              <strong>{totalAccess}</strong>
            </div>
          </article>

          <article className="statCard">
            <div className="statIcon">Ⅱ</div>
            <div>
              <span>Desativados</span>
              <strong>{inactiveQr}</strong>
            </div>
          </article>
        </section>

        <section className="panel" id="novo-qr">
          <div className="panelHeader">
            <div>
              <h2>Criar novo QR Code</h2>
              <p>O QR permanece o mesmo mesmo quando você altera o destino.</p>
            </div>
          </div>

          <form className="createForm" onSubmit={create}>
            <div className="field">
              <label>Identificação</label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Localização da loja"
                required
              />
            </div>

            <div className="field">
              <label>Link de destino</label>

              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                required
              />
            </div>

            <button className="primaryButton createButton">
              Criar QR Code
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <h2>Meus QR Codes</h2>
              <p>{items.length} códigos cadastrados</p>
            </div>

            <button className="secondaryButton" onClick={load}>
              ↻ Atualizar
            </button>
          </div>

          {loading ? (
            <div className="emptyState">Carregando QR Codes...</div>
          ) : items.length === 0 ? (
            <div className="emptyState">
              Você ainda não possui QR Codes cadastrados.
            </div>
          ) : (
            <div className="qrTable">
              <div className="tableHeader">
                <span>QR CODE</span>
                <span>IDENTIFICAÇÃO</span>
                <span>DESTINO</span>
                <span>ACESSOS</span>
                <span>STATUS</span>
                <span>AÇÕES</span>
              </div>

              {items.map((x) => (
                <div className="tableRow" key={x.id}>
                  <div className="qrMini">QR</div>

                  <div className="qrName">
                    <strong>{x.name}</strong>
                    <small>{x.slug}</small>
                  </div>

                  <div className="destination">
                    <a
                      href={x.destination_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {x.destination_url}
                    </a>
                  </div>

                  <strong className="accessNumber">
                    {x.scans?.[0]?.count || 0}
                  </strong>

                  <span
                    className={
                      x.active ? 'status activeStatus' : 'status inactiveStatus'
                    }
                  >
                    {x.active ? 'ATIVO' : 'INATIVO'}
                  </span>

                  <div className="actions">
                    <button onClick={() => qr(x)} title="Baixar QR">
                      ↓
                    </button>

                    <button onClick={() => edit(x)} title="Editar link">
                      ✎
                    </button>

                    <button
                      onClick={() => toggle(x)}
                      title={x.active ? 'Desativar' : 'Ativar'}
                    >
                      {x.active ? 'Ⅱ' : '▶'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
