package com.cleany.infojobs.infrastructure.infojobs;

import com.cleany.infojobs.domain.model.EmployerApplication;
import com.cleany.infojobs.domain.model.EmployerOffer;
import com.cleany.infojobs.domain.port.EmployerGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class EmployerGatewayAdapter implements EmployerGateway {

    private static final Logger log = LoggerFactory.getLogger(EmployerGatewayAdapter.class);
    private final WebClient webClient;

    public EmployerGatewayAdapter(@Qualifier("employerWebClient") WebClient infoJobsWebClient) {
        this.webClient = infoJobsWebClient;
    }

    @Override
    public List<EmployerOffer> fetchOffers() {
        String requestBody = """
                <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                  <soapenv:Header/>
                  <soapenv:Body>
                    <GetOffersRequest/>
                  </soapenv:Body>
                </soapenv:Envelope>
                """;

        String xml = webClient.post()
                .uri("/employer/offers")
                .contentType(MediaType.TEXT_XML)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch employer offers from InfoJobs SOAP", ex);
                    return Mono.just("");
                })
                .block();

        return parseOffers(xml);
    }

    @Override
    public List<EmployerApplication> fetchApplications(String offerId) {
        String requestBody = """
                <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
                  <soapenv:Header/>
                  <soapenv:Body>
                    <GetApplicationsRequest>
                      <offerId>%s</offerId>
                    </GetApplicationsRequest>
                  </soapenv:Body>
                </soapenv:Envelope>
                """.formatted(offerId);

        String xml = webClient.post()
                .uri("/employer/applications")
                .contentType(MediaType.TEXT_XML)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(ex -> {
                    log.error("Failed to fetch employer applications from InfoJobs SOAP", ex);
                    return Mono.just("");
                })
                .block();

        return parseApplications(xml, offerId);
    }

    private List<EmployerOffer> parseOffers(String xml) {
        if (xml == null || xml.isBlank()) {
            return List.of();
        }
        List<EmployerOffer> offers = new ArrayList<>();
        Document doc = parseXml(xml);
        if (doc == null) return offers;
        NodeList nodes = doc.getElementsByTagName("offer");
        for (int i = 0; i < nodes.getLength(); i++) {
            var node = nodes.item(i);
            var id = getChildValue(node, "id");
            var title = getChildValue(node, "title");
            var applications = parseIntSafe(getChildValue(node, "applications"));
            offers.add(new EmployerOffer(id, title, applications));
        }
        return offers;
    }

    private List<EmployerApplication> parseApplications(String xml, String offerId) {
        if (xml == null || xml.isBlank()) {
            return List.of();
        }
        List<EmployerApplication> apps = new ArrayList<>();
        Document doc = parseXml(xml);
        if (doc == null) return apps;
        NodeList nodes = doc.getElementsByTagName("application");
        for (int i = 0; i < nodes.getLength(); i++) {
            var node = nodes.item(i);
            var id = getChildValue(node, "id");
            var candidateName = getChildValue(node, "candidateName");
            var status = getChildValue(node, "status");
            apps.add(new EmployerApplication(id, candidateName, status, offerId));
        }
        return apps;
    }

    private Document parseXml(String xml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);
            DocumentBuilder builder = factory.newDocumentBuilder();
            return builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("Failed to parse SOAP XML", e);
            return null;
        }
    }

    private String getChildValue(org.w3c.dom.Node parent, String tag) {
        NodeList children = ((org.w3c.dom.Element) parent).getElementsByTagName(tag);
        if (children.getLength() == 0) return null;
        return children.item(0).getTextContent();
    }

    private int parseIntSafe(String value) {
        try {
            return value != null ? Integer.parseInt(value) : 0;
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
