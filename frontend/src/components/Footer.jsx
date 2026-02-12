import styled from 'styled-components'

const FooterWrapper = styled.footer`
  text-align: center;
  margin: 0;
  border-top: none;
  margin-top: -1px;
  padding: 20px 0;

  p { margin: 5px 0; }

  a {
    color: var(--main-color);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`

export default function Footer() {
    return (
        <FooterWrapper>
            <p>© 2023 Oblivion Blog. All rights reserved. Designed by{' '}<a href="https://inpa.in">Anya</a>.</p>
            <p><i className="fa-solid fa-memory"></i> Memory usage: 0 MB.</p>
            <p><i className="fa-solid fa-ethernet"></i> IP Address: 0.0.0.0</p>
        </FooterWrapper>
    )
}
