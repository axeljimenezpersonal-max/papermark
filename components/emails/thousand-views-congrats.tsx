import React from "react";

import {
  Body,
  Head,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface ThousandViewsCongratsEmailProps {
  name: string | null | undefined;
}

const ThousandViewsCongratsEmail = ({
  name,
}: ThousandViewsCongratsEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>1000 views on Bóveda SINAPSYS.</Preview>
      <Tailwind>
        <Body className="font-sans text-sm">
          <Text>Hi{name && ` ${name}`},</Text>
          <Text>
            This is the Bóveda SINAPSYS team. Congrats on 1000 views on your
            documents.
          </Text>
          <Text>How is your experience so far?</Text>

          <Text>
            Thanks so much,
            <br />
            Marc
          </Text>
          <Text>
            <Link
              href="https://sinapsys.mx"
              target="_blank"
              className="text-blue-500 underline"
              rel="noopener noreferrer"
            >
              Visit sinapsys.mx
            </Link>
          </Text>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ThousandViewsCongratsEmail;
